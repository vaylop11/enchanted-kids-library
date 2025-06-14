
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

  // For translation range
  const [fromPage, setFromPage] = useState(1);
  const [toPage, setToPage] = useState<number | null>(null);

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

  // Set PDF page count and max value for toPage
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setToPage(numPages);
  };

  // Extract text from a given page
  const extractPageText = useCallback(async (page: number): Promise<string> => {
    if (!pdfUrl || !id) return '';
    try {
      const extractedText = await extractTextFromPDF(pdfUrl, id, undefined, {
        quickMode: true,
        maxPages: 1,
        specificPage: page
      });
      return extractedText;
    } catch (error) {
      console.error(`Error extracting text from page ${page}:`, error);
      return '';
    }
  }, [pdfUrl, id]);

  // --- Controls user input for page range ---
  const handleFromPageChange = (val: string) => {
    const value = Number(val);
    if (value < 1) setFromPage(1);
    else if (toPage && value > toPage) setFromPage(toPage);
    else setFromPage(value);
  };
  const handleToPageChange = (val: string) => {
    const value = Number(val);
    if (!numPages) return;
    if (value < fromPage) setToPage(fromPage);
    else if (value > numPages) setToPage(numPages);
    else setToPage(value);
  };


  // --- Manual translation of page range ---
  const handleTranslateRange = async () => {
    // Prevent if language or range are not set
    if (!targetLanguage) {
      toast.error(language === "ar" ? "يرجى اختيار اللغة أولاً" : "Please select a language first");
      return;
    }
    if (!fromPage || !toPage || !numPages) {
      toast.error(language === "ar" ? "حدد نطاق الصفحات بدقة" : "Specify a valid page range");
      return;
    }
    if (fromPage < 1 || toPage > numPages || fromPage > toPage) {
      toast.error(language === "ar" ? "نطاق صفحات غير صحيح" : "Invalid page range");
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');

    let combined = '';
    for (let page = fromPage; page <= (toPage ?? fromPage); page++) {
      const pageText = await extractPageText(page);
      if (!pageText.trim()) {
        combined += (language === 'ar' 
          ? `\n=== الصفحة ${page} (لا يوجد نص) ===\n\n` 
          : `\n=== Page ${page} (empty) ===\n\n`);
        continue;
      }
      try {
        const result = await translateText(pageText, targetLanguage);
        combined += `${language === 'ar' ? `=== الصفحة ${page} ===` : `=== Page ${page} ===`}\n\n${result.translatedText}\n\n`;
      } catch {
        combined += (language === "ar"
          ? `\n=== الصفحة ${page} (فشل الترجمة) ===\n\n`
          : `\n=== Page ${page} (translation failed) ===\n\n`);
      }
    }

    setTranslatedText(combined.trim());
    setIsTranslating(false);
    toast.success(language === 'ar' ? "تمت الترجمة!" : "Translation completed!");
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
      a.download = `${pdfTitle}_translation_${fromPage}_${toPage}.txt`;
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
                    onPageChange={setCurrentPage}
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
                <div className="p-4 border-b bg-muted/20 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                  <div className="flex-1 flex flex-col gap-1">
                    <h2 className="font-semibold text-base sm:text-lg">{language === 'ar' ? 'إعدادات الترجمة' : 'Translation Settings'}</h2>
                    <p className="text-sm text-muted-foreground">{language === 'ar'
                      ? "اختر اللغة وحدد نطاق الصفحات ثم اضغط 'ترجمة'"
                      : "Select language and page range, then press 'Translate'."
                    }</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <LanguageSelector
                      value={targetLanguage}
                      onValueChange={v => setTargetLanguage(v)}
                      disabled={isTranslating}
                    />
                    <input
                      type="number"
                      min={1}
                      max={numPages ?? 1}
                      value={fromPage}
                      onChange={e => handleFromPageChange(e.target.value)}
                      className="w-20 mx-1 py-1 px-2 rounded border border-input text-sm focus-visible:ring-2"
                      placeholder={language === "ar" ? "من صفحة" : "From page"}
                      disabled={isTranslating || !numPages}
                    />
                    <span className="font-bold px-1">-</span>
                    <input
                      type="number"
                      min={fromPage}
                      max={numPages ?? 1}
                      value={toPage ?? ''}
                      onChange={e => handleToPageChange(e.target.value)}
                      className="w-20 py-1 px-2 rounded border border-input text-sm focus-visible:ring-2"
                      placeholder={language === "ar" ? "إلى صفحة" : "To page"}
                      disabled={isTranslating || !numPages}
                    />
                    <Button
                      onClick={handleTranslateRange}
                      disabled={isTranslating || !targetLanguage || !numPages}
                      className="text-xs ml-2"
                      variant="default"
                    >
                      {isTranslating
                        ? (language === 'ar' ? "جار الترجمة..." : "Translating...")
                        : (language === 'ar' ? "ترجمة" : "Translate")}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 px-4 border-b bg-muted/40">
                  <span className="text-xs text-muted-foreground">{language === 'ar' 
                    ? `النص المترجم للصفحات من ${fromPage} إلى ${toPage ?? '?'}`
                    : `Translated text for pages ${fromPage} to ${toPage ?? '?'}`}</span>
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
                <div className="overflow-auto h-[45vh] sm:h-[55vh] p-4">
                  {translatedText ? (
                    <div className="w-full">
                      <MarkdownMessage content={translatedText} className="break-words" />
                    </div>
                  ) : (
                    <div className="text-center text-sm text-muted-foreground mt-10">
                      {language === 'ar' 
                        ? "حدد اللغة ونطاق الصفحات ثم اضغط ترجمة." 
                        : "Choose language and page range, then press Translate."}
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
