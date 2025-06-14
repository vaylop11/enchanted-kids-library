
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, FileText, Copy, Download, Play, Pause, RotateCcw } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  const [translationProgress, setTranslationProgress] = useState(0);

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
    setTranslationProgress(0);

    const totalPages = toPage - fromPage + 1;
    let combined = '';
    
    for (let page = fromPage; page <= (toPage ?? fromPage); page++) {
      const currentProgress = ((page - fromPage) / totalPages) * 100;
      setTranslationProgress(currentProgress);
      
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
    setTranslationProgress(100);
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

  const resetTranslation = () => {
    setTranslatedText('');
    setTranslationProgress(0);
    setTargetLanguage('');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted/10 to-background">
      <SEO 
        title={`${language === 'ar' ? 'ترجمة: ' : 'Translate: '} ${pdfTitle}`}
        description={language === 'ar' 
          ? `ترجمة ملف PDF "${pdfTitle}" إلى لغات متعددة` 
          : `Translate PDF "${pdfTitle}" to multiple languages`}
      />
      <Navbar />
      <main className="flex-1 pt-24 pb-10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <Link 
              to={id ? `/pdf/${id}` : '/pdfs'} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'} group-hover:-translate-x-1 transition-transform`} />
              {language === 'ar' ? 'العودة إلى عارض الملف' : 'Back to PDF Viewer'}
            </Link>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {language === 'ar' ? 'ترجمة احترافية' : 'Professional Translation'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'ترجم مستنداتك بدقة عالية' : 'Translate your documents with high accuracy'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* PDF Viewer Card */}
            <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-muted/20">
              <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30 pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {language === 'ar' ? 'استعراض المستند' : 'Document Preview'}
                      </h3>
                      <p className="text-sm text-muted-foreground font-normal truncate max-w-[200px]">
                        {pdfTitle}
                      </p>
                    </div>
                  </CardTitle>
                  {numPages && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {numPages} {language === 'ar' ? 'صفحة' : 'pages'}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="bg-muted/20 h-[65vh] sm:h-[75vh] relative overflow-hidden">
                  {!isLoaded ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                      <div className="relative">
                        <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
                        <FileText className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      </div>
                      <p className="text-muted-foreground animate-pulse">
                        {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
                      </p>
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
              </CardContent>
            </Card>

            {/* Translation Panel */}
            <div className="space-y-6">
              {/* Translation Controls Card */}
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-muted/20">
                <CardHeader className="border-b bg-gradient-to-r from-emerald-500/5 to-blue-500/5 pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Play className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-emerald-700 dark:text-emerald-400">
                        {language === 'ar' ? 'إعدادات الترجمة' : 'Translation Settings'}
                      </h3>
                      <p className="text-sm text-muted-foreground font-normal">
                        {language === 'ar' ? 'اختر اللغة وحدد النطاق' : 'Select language and range'}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Language Selection */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'ar' ? 'اللغة المستهدفة' : 'Target Language'}
                    </label>
                    <LanguageSelector
                      value={targetLanguage}
                      onValueChange={setTargetLanguage}
                      disabled={isTranslating}
                    />
                  </div>

                  <Separator />

                  {/* Page Range Selection */}
                  <div className="space-y-4">
                    <label className="text-sm font-medium text-foreground">
                      {language === 'ar' ? 'نطاق الصفحات' : 'Page Range'}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {language === 'ar' ? 'من' : 'From'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={numPages ?? 1}
                          value={fromPage}
                          onChange={e => handleFromPageChange(e.target.value)}
                          className="w-full py-2 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          disabled={isTranslating || !numPages}
                        />
                      </div>
                      <div className="flex items-center justify-center pt-5">
                        <div className="w-4 h-px bg-border"></div>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground mb-1 block">
                          {language === 'ar' ? 'إلى' : 'To'}
                        </label>
                        <input
                          type="number"
                          min={fromPage}
                          max={numPages ?? 1}
                          value={toPage ?? ''}
                          onChange={e => handleToPageChange(e.target.value)}
                          className="w-full py-2 px-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                          disabled={isTranslating || !numPages}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isTranslating && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {language === 'ar' ? 'تقدم الترجمة' : 'Translation Progress'}
                        </span>
                        <span className="text-primary font-medium">{Math.round(translationProgress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${translationProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleTranslateRange}
                      disabled={isTranslating || !targetLanguage || !numPages}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      size="lg"
                    >
                      {isTranslating ? (
                        <>
                          <Pause className="mr-2 h-4 w-4 animate-pulse" />
                          {language === 'ar' ? 'جار الترجمة...' : 'Translating...'}
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          {language === 'ar' ? 'ابدأ الترجمة' : 'Start Translation'}
                        </>
                      )}
                    </Button>
                    
                    {translatedText && (
                      <Button
                        onClick={resetTranslation}
                        variant="outline"
                        size="lg"
                        className="hover:bg-muted/50"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Translation Results Card */}
              <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card via-card to-muted/20">
                <CardHeader className="border-b bg-gradient-to-r from-blue-500/5 to-purple-500/5 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-blue-700 dark:text-blue-400">
                          {language === 'ar' ? 'نتائج الترجمة' : 'Translation Results'}
                        </h3>
                        {translatedText && (
                          <p className="text-sm text-muted-foreground font-normal">
                            {language === 'ar' 
                              ? `الصفحات ${fromPage}-${toPage} • ${targetLanguage}`
                              : `Pages ${fromPage}-${toPage} • ${targetLanguage}`}
                          </p>
                        )}
                      </div>
                    </CardTitle>
                    
                    {translatedText && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCopyText}
                          className="h-9 w-9 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          title={language === 'ar' ? 'نسخ النص' : 'Copy text'}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadTranslation}
                          className="h-9 w-9 p-0 hover:bg-green-50 dark:hover:bg-green-900/20"
                          title={language === 'ar' ? 'تحميل الترجمة' : 'Download translation'}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="h-[45vh] sm:h-[55vh] overflow-auto">
                    {translatedText ? (
                      <div className="p-6">
                        <MarkdownMessage content={translatedText} className="break-words" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <div className="p-4 bg-muted/50 rounded-full mb-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h4 className="font-medium text-foreground mb-2">
                          {language === 'ar' ? 'لا توجد ترجمة بعد' : 'No translation yet'}
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          {language === 'ar' 
                            ? 'اختر لغة الترجمة ونطاق الصفحات، ثم اضغط على "ابدأ الترجمة" لرؤية النتائج هنا.'
                            : 'Select target language and page range, then click "Start Translation" to see results here.'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TranslatePDF;
