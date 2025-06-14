import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, FileText, Copy, Download, RotateCcw } from 'lucide-react';
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
import TranslationProgress from '@/components/ui/translation-progress';
import LanguageSelector from '@/components/ui/language-selector';
import BatchTranslationManager from '@/components/ui/batch-translation-manager';
import { Button } from '@/components/ui/button';

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
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTempPdf, setIsTempPdf] = useState(false);
  const [translatedPages, setTranslatedPages] = useState<number[]>([]);
  const [pageTexts, setPageTexts] = useState<Map<number, string>>(new Map());
  const [isCachedTranslation, setIsCachedTranslation] = useState(false);

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

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const extractPageText = useCallback(async (page: number): Promise<string> => {
    if (!pdfUrl || !id) return '';
    
    // Check if we already have the text cached
    if (pageTexts.has(page)) {
      return pageTexts.get(page)!;
    }

    try {
      const extractedText = await extractTextFromPDF(pdfUrl, id, undefined, {
        quickMode: true,
        maxPages: 1,
        specificPage: page
      });
      
      setPageTexts(prev => new Map(prev).set(page, extractedText));
      return extractedText;
    } catch (error) {
      console.error(`Error extracting text from page ${page}:`, error);
      return '';
    }
  }, [pdfUrl, id, pageTexts]);

  const translateCurrentPage = useCallback(async (page: number, lang: string, forceRefresh = false) => {
    if (!pdfUrl || !id || !lang) return;
    
    // Check cache first (unless forced refresh)
    if (!forceRefresh) {
      const cachedTranslation = translationCache.getCachedTranslation(id, page, lang);
      if (cachedTranslation) {
        setTranslatedText(cachedTranslation);
        setIsCachedTranslation(true);
        setTranslatedPages(prev => [...new Set([...prev, page])]);
        toast.success(language === 'ar' ? 'تم تحميل الترجمة من التخزين المؤقت' : 'Loaded cached translation');
        return;
      }
    }
    
    setIsTranslating(true);
    setTranslatedText('');
    setIsCachedTranslation(false);
    
    try {
      const extractedText = await extractPageText(page);
      if (!extractedText.trim()) {
        toast.warning(language === 'ar' ? 'لا يوجد نص للترجمة في هذه الصفحة' : 'No text to translate on this page');
        setIsTranslating(false);
        return;
      }
      
      const result = await translateText(extractedText, lang);
      setTranslatedText(result.translatedText);
      
      // Cache the translation
      translationCache.storeTranslation(id, page, extractedText, lang, result.translatedText);
      setTranslatedPages(prev => [...new Set([...prev, page])]);
      
      toast.success(language === 'ar' ? 'تمت الترجمة بنجاح' : 'Translation completed successfully');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(language === 'ar' ? 'فشل في ترجمة النص' : 'Failed to translate text');
    } finally {
      setIsTranslating(false);
    }
  }, [pdfUrl, id, language, extractPageText]);

  const handlePageChange = useCallback(async (newPage: number) => {
    setCurrentPage(newPage);
  }, []);

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
      a.download = `${pdfTitle}_translation_page_${currentPage}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ar' ? 'تم تحميل الملف' : 'File downloaded');
    }
  };

  const handleTranslateAll = async (
    onProgress: (page: number, total: number) => void, 
    fromPage?: number, 
    toPage?: number
  ) => {
    if (!numPages || !targetLanguage) return;

    const startPage = fromPage ?? 1;
    const endPage = toPage ?? numPages;

    for (let page = startPage; page <= endPage; page++) {
      onProgress(page, endPage - startPage + 1);

      if (translationCache.hasTranslation(id || '', page, targetLanguage)) {
        continue;
      }
      await translateCurrentPage(page, targetLanguage);

      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const handleDownloadAll = () => {
    if (!id || translatedPages.length === 0) return;

    let allTranslations = '';
    translatedPages.sort((a, b) => a - b).forEach(page => {
      const cached = translationCache.getCachedTranslation(id, page, targetLanguage);
      if (cached) {
        allTranslations += `=== ${language === 'ar' ? 'الصفحة' : 'Page'} ${page} ===\n\n${cached}\n\n`;
      }
    });

    if (allTranslations) {
      const blob = new Blob([allTranslations], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${pdfTitle}_all_translations_${targetLanguage}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ar' ? 'تم تحميل جميع الترجمات' : 'All translations downloaded');
    }
  };

  const handleRefreshTranslation = () => {
    translateCurrentPage(currentPage, targetLanguage, true);
  };

  useEffect(() => {
  }, []);

  useEffect(() => {
    if (id && targetLanguage) {
      const cachedPages = translationCache.getCachedPages(id, targetLanguage);
      setTranslatedPages(cachedPages);
    }
  }, [id, targetLanguage]);

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
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Link 
              to={id ? `/pdf/${id}` : '/pdfs'} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة إلى عارض الملف' : 'Back to PDF Viewer'}
            </Link>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <LanguageSelector
                value={targetLanguage}
                onValueChange={setTargetLanguage}
                disabled={isTranslating}
              />
              
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h1 className="text-lg sm:text-xl font-semibold">
                  {language === 'ar' ? 'ترجمة الملف' : 'Translate PDF'}
                </h1>
              </div>
            </div>
          </div>

          {/* Current page indicator and controls */}
          {numPages && (
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                {language === 'ar' 
                  ? `الصفحة ${currentPage} من ${numPages}` 
                  : `Page ${currentPage} of ${numPages}`}
              </span>
              
              <div className="flex items-center gap-2">
                
                
                {translatedText && (
                  <Button
                    onClick={handleRefreshTranslation}
                    variant="outline"
                    size="sm"
                    disabled={isTranslating}
                    className="text-xs"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          )}
          
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
                    onDocumentLoadSuccess={({ numPages }) => setNumPages(numPages)}
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
            <div className="space-y-4">
              {/* Batch Translation Manager */}
              {numPages && (
                <BatchTranslationManager
                  totalPages={numPages}
                  currentTargetLanguage={targetLanguage}
                  onTranslateAll={handleTranslateAll}
                  onDownloadAll={handleDownloadAll}
                  translatedPages={translatedPages}
                />
              )}
              
              {/* Translation Panel */}
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b bg-muted/20 flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-base sm:text-lg">
                      {language === 'ar' ? 'النص المترجم' : 'Translated Text'}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isTranslating 
                        ? (language === 'ar' ? 'جار الترجمة...' : 'Translating...') 
                        : translatedText 
                          ? (language === 'ar' ? 'الترجمة جاهزة' : 'Translation ready')
                          : (language === 'ar' ? 'اختر لغة للترجمة' : 'Select language to translate')}
                    </p>
                  </div>
                  
                  {translatedText && !isTranslating && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyText}
                        className="h-8 w-8 p-0"
                        title={language === 'ar' ? 'نسخ النص' : 'Copy text'}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTranslation}
                        className="h-8 w-8 p-0"
                        title={language === 'ar' ? 'تحميل الترجمة' : 'Download translation'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="overflow-auto bg-muted/10 h-[50vh] sm:h-[60vh]">
                  <TranslationProgress
                    isTranslating={isTranslating}
                    translatedText={translatedText}
                    targetLanguage={targetLanguage}
                    currentPage={currentPage}
                    totalPages={numPages}
                    isCached={isCachedTranslation}
                  />
                  
                  {translatedText && !isTranslating && (
                    <div className="p-4">
                      <MarkdownMessage content={translatedText} />
                    </div>
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
