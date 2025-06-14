
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, FileText, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import { getPDFById } from '@/services/pdfStorage';
import { getSupabasePDFById } from '@/services/pdfSupabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { extractTextFromPDF } from '@/services/pdfAnalysisService';
import { translateText } from '@/services/translationService';
import { translationCache } from '@/services/translationCacheService';
import SEO from '@/components/SEO';
import { MarkdownMessage } from '@/components/ui/markdown-message';
import ScrollablePDFViewer from '@/components/ui/scrollable-pdf-viewer';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/ui/language-selector';
import TranslationProgress from '@/components/ui/translation-progress';

const TranslatePDF = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTempPdf, setIsTempPdf] = useState(false);

  // Cache for page translations
  const [pageTranslations, setPageTranslations] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const loadPdf = async () => {
      if (id.startsWith('temp-') || window.location.pathname.includes('/pdf/temp/')) {
        setIsTempPdf(true);
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (parsedData.fileData && parsedData.fileData.id === id) {
              setPdfUrl(parsedData.fileData.dataUrl);
              setPdfTitle(parsedData.fileData.title);
              setIsLoaded(true);
              return;
            }
          } catch (error) {
            console.error('Error parsing temporary PDF:', error);
          }
        }
        toast.error(language === 'ar' ? 'لم يتم العثور على الملف المؤقت' : 'Temporary PDF not found');
        navigate('/');
        return;
      }

      const loadedPdf = getPDFById(id);
      if (loadedPdf) {
        setPdfTitle(loadedPdf.title);
        
        if (loadedPdf.dataUrl) {
          setPdfUrl(loadedPdf.dataUrl);
          setIsLoaded(true);
        } else if (user) {
          tryLoadFromSupabase(id);
        } else {
          toast.error(language === 'ar' 
            ? 'تعذر تحميل بيانات PDF بسبب قيود التخزين' 
            : 'Could not load PDF data due to storage limitations');
          navigate('/pdfs');
        }
      } else {
        tryLoadFromSupabase(id);
      }
    };

    const tryLoadFromSupabase = async (pdfId: string) => {
      if (!user) {
        toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لعرض هذا الملف' : 'Please sign in to view this PDF');
        navigate('/login');
        return;
      }
      
      try {
        const supabasePdf = await getSupabasePDFById(pdfId);
        
        if (supabasePdf && supabasePdf.fileUrl) {
          setPdfUrl(supabasePdf.fileUrl);
          setPdfTitle(supabasePdf.title);
          setIsLoaded(true);
        } else {
          toast.error(language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF not found');
          navigate('/pdfs');
          return;
        }
      } catch (error) {
        console.error('Error loading PDF from Supabase:', error);
        toast.error(language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF not found');
        navigate('/pdfs');
        return;
      }
    };

    loadPdf();
  }, [id, navigate, language, user]);

  // Set PDF page count
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Handle page change from PDF viewer
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    
    // Check if we have a cached translation for this page and current target language
    const cacheKey = `${pageNumber}-${targetLanguage}`;
    if (pageTranslations[cacheKey]) {
      setTranslatedText(pageTranslations[cacheKey]);
    } else {
      setTranslatedText('');
    }
  };

  // Extract text from current page
  const extractCurrentPageText = useCallback(async (): Promise<string> => {
    if (!pdfUrl || !id) return '';
    try {
      const extractedText = await extractTextFromPDF(pdfUrl, id, undefined, {
        quickMode: true,
        maxPages: 1,
        specificPage: currentPage
      });
      return extractedText;
    } catch (error) {
      console.error(`Error extracting text from page ${currentPage}:`, error);
      return '';
    }
  }, [pdfUrl, id, currentPage]);

  // Translate current page
  const handleTranslateCurrentPage = async () => {
    if (!targetLanguage) {
      toast.error(language === "ar" ? "يرجى اختيار اللغة أولاً" : "Please select a language first");
      return;
    }

    // Check cache first
    const cacheKey = `${currentPage}-${targetLanguage}`;
    if (pageTranslations[cacheKey]) {
      setTranslatedText(pageTranslations[cacheKey]);
      toast.success(language === 'ar' ? 'تم استخدام الترجمة المحفوظة' : 'Using cached translation');
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    try {
      const pageText = await extractCurrentPageText();
      if (!pageText.trim()) {
        const emptyMessage = language === 'ar' 
          ? `الصفحة ${currentPage} فارغة أو لا تحتوي على نص قابل للاستخراج`
          : `Page ${currentPage} is empty or contains no extractable text`;
        
        setTranslatedText(emptyMessage);
        setPageTranslations(prev => ({ ...prev, [cacheKey]: emptyMessage }));
        setIsTranslating(false);
        return;
      }

      const result = await translateText(pageText, targetLanguage);
      const translatedPageText = `${language === 'ar' ? `=== الصفحة ${currentPage} ===` : `=== Page ${currentPage} ===`}\n\n${result.translatedText}`;
      
      setTranslatedText(translatedPageText);
      setPageTranslations(prev => ({ ...prev, [cacheKey]: translatedPageText }));
      
      toast.success(language === 'ar' ? 'تمت ترجمة الصفحة!' : 'Page translated successfully!');
    } catch (error) {
      console.error('Translation error:', error);
      const errorMessage = language === "ar"
        ? `فشل في ترجمة الصفحة ${currentPage}`
        : `Failed to translate page ${currentPage}`;
      
      setTranslatedText(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleCopyText = async () => {
    if (translatedText) {
      try {
        await navigator.clipboard.writeText(translatedText);
        toast.success(language === 'ar' ? 'تم نسخ النص' : 'Text copied');
      } catch (error) {
        toast.error(language === 'ar' ? 'فشل في نسخ النص' : 'Failed to copy text');
      }
    }
  };

  const handleDownloadTranslation = () => {
    if (translatedText) {
      const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfTitle}_page_${currentPage}_translation.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ar' ? 'تم تحميل الملف' : 'File downloaded');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={`${language === 'ar' ? 'ترجمة: ' : 'Translate: '} ${pdfTitle}`}
        description={language === 'ar' 
          ? `ترجمة ملف PDF "${pdfTitle}" إلى لغات متعددة` 
          : `Translate PDF "${pdfTitle}" to multiple languages`}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link 
              to={id ? `/pdf/${id}` : '/pdfs'} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة إلى عارض الملف' : 'Back to PDF Viewer'}
            </Link>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-lg sm:text-xl font-semibold">{language === 'ar' ? 'ترجمة الملف' : 'Translate PDF'}</h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PDF Viewer */}
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-muted/20">
                <h2 className="font-semibold text-base sm:text-lg">
                  {language === 'ar' ? 'استعراض الملف' : 'PDF Preview'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 truncate">
                  {pdfTitle}
                </p>
              </div>
              
              <div className="overflow-hidden bg-muted/10 h-[60vh] sm:h-[70vh]">
                {!isLoaded ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
                  </div>
                ) : pdfUrl ? (
                  <ScrollablePDFViewer
                    pdfUrl={pdfUrl}
                    onDocumentLoadSuccess={handleDocumentLoadSuccess}
                    onPageChange={handlePageChange}
                    className="h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا يمكن تحميل الملف' : 'Cannot load PDF'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Translation Panel */}
            <div className="space-y-6">
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/20">
                  <div className="flex flex-col gap-4">
                    <div className="flex-1">
                      <h2 className="font-semibold text-base sm:text-lg">{language === 'ar' ? 'ترجمة الصفحة الحالية' : 'Translate Current Page'}</h2>
                      <p className="text-sm text-muted-foreground">{language === 'ar'
                        ? `ترجم الصفحة ${currentPage} إلى اللغة المطلوبة`
                        : `Translate page ${currentPage} to your desired language`
                      }</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <LanguageSelector
                        value={targetLanguage}
                        onValueChange={setTargetLanguage}
                        disabled={isTranslating}
                      />
                      
                      <Button
                        onClick={handleTranslateCurrentPage}
                        disabled={isTranslating || !targetLanguage || !numPages}
                        className="w-full sm:w-auto"
                        variant="default"
                      >
                        {isTranslating
                          ? (language === 'ar' ? "جار الترجمة..." : "Translating...")
                          : (language === 'ar' ? `ترجم الصفحة ${currentPage}` : `Translate Page ${currentPage}`)}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 px-4 border-b bg-muted/40">
                  <span className="text-xs text-muted-foreground">{language === 'ar' 
                    ? `النص المترجم للصفحة ${currentPage}`
                    : `Translated text for page ${currentPage}`}</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyText}
                      className="h-8 w-8 p-0"
                      disabled={!translatedText}
                      title={language === 'ar' ? 'نسخ النص' : 'Copy text'}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadTranslation}
                      className="h-8 w-8 p-0"
                      disabled={!translatedText}
                      title={language === 'ar' ? 'تحميل الترجمة' : 'Download translation'}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-[45vh] sm:h-[55vh] p-4 overflow-auto">
                  {isTranslating ? (
                    <TranslationProgress
                      isTranslating={true}
                      translatedText=""
                      targetLanguage={targetLanguage}
                      currentPage={currentPage}
                      totalPages={numPages || undefined}
                    />
                  ) : translatedText ? (
                    <div className="w-full space-y-4">
                      <TranslationProgress
                        isTranslating={false}
                        translatedText={translatedText}
                        targetLanguage={targetLanguage}
                        currentPage={currentPage}
                        totalPages={numPages || undefined}
                        isCached={pageTranslations[`${currentPage}-${targetLanguage}`] ? true : false}
                      />
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <MarkdownMessage content={translatedText} className="break-words whitespace-pre-wrap" />
                      </div>
                    </div>
                  ) : (
                    <TranslationProgress
                      isTranslating={false}
                      translatedText=""
                      targetLanguage={targetLanguage}
                      currentPage={currentPage}
                      totalPages={numPages || undefined}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TranslatePDF;
