import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, FileText, Languages, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { getPDFById } from '@/services/pdfStorage';
import { getSupabasePDFById } from '@/services/pdfSupabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { extractTextFromPDF } from '@/services/pdfAnalysisService';
import { translateText, supportedLanguages } from '@/services/translationService';
import SEO from '@/components/SEO';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const TranslatePDF = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl, ] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTempPdf, setIsTempPdf] = useState(false);

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

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
      // Automatically translate the new page
      await translateCurrentPage(newPage, targetLanguage);
    }
  };

  const translateCurrentPage = async (page: number, lang: string) => {
    if (!pdfUrl) return;
    
    setIsTranslating(true);
    setTranslatedText('');
    
    try {
      // Extract text from the current page
      const extractedText = await extractTextFromPDF(pdfUrl, id || 'temp', undefined, {
        quickMode: true,
        maxPages: 1,
        specificPage: page
      });
      
      // Translate the extracted text
      const result = await translateText(extractedText, lang);
      setTranslatedText(result.translatedText);
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(language === 'ar'
        ? 'فشل في ترجمة النص'
        : 'Failed to translate text');
    } finally {
      setIsTranslating(false);
    }
  };

  // Trigger translation when target language changes
  useEffect(() => {
    if (isLoaded && targetLanguage) {
      translateCurrentPage(pageNumber, targetLanguage);
    }
  }, [targetLanguage, isLoaded]);

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
          <div className="flex justify-between items-center mb-6">
            <Link 
              to={id ? `/pdf/${id}` : '/pdfs'} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة إلى عارض الملف' : 'Back to PDF Viewer'}
            </Link>
            
            <div className="flex items-center gap-4">
              <Select
                value={targetLanguage}
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={language === 'ar' ? 'اختر لغة' : 'Select language'} />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold">
                  {language === 'ar' ? 'ترجمة الملف' : 'Translate PDF'}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">
                  {language === 'ar' ? 'استعراض الملف' : 'PDF Preview'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {pdfTitle}
                </p>
              </div>
              
              <div className="p-4 overflow-auto bg-muted/10 min-h-[60vh] flex justify-center">
                {!isLoaded ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
                  </div>
                ) : (
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={handleDocumentLoadSuccess}
                    loading={
                      <div className="flex items-center justify-center h-full w-full">
                        <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
                      </div>
                    }
                  >
                    <Page 
                      pageNumber={pageNumber} 
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </Document>
                )}
              </div>
              
              <div className="p-4 border-t bg-muted/10 flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber - 1)}
                  disabled={pageNumber <= 1}
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </Button>
                
                <div className="text-sm">
                  {language === 'ar' 
                    ? `صفحة ${pageNumber} من ${numPages || '?'}`
                    : `Page ${pageNumber} of ${numPages || '?'}`}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pageNumber + 1)}
                  disabled={!numPages || pageNumber >= numPages}
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </Button>
              </div>
            </div>
            
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">
                  {language === 'ar' ? 'النص المترجم' : 'Translated Text'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isTranslating 
                    ? (language === 'ar' ? 'جار الترجمة...' : 'Translating...') 
                    : (language === 'ar' ? 'الترجمة جاهزة' : 'Translation ready')}
                </p>
              </div>
              
              <div className="p-4 overflow-auto bg-muted/10 min-h-[60vh]">
                {isTranslating ? (
                  <div className="flex flex-col items-center justify-center h-full gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'جار الترجمة...' : 'Translating...'}
                    </p>
                  </div>
                ) : translatedText ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{translatedText}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    {language === 'ar' 
                      ? 'اختر لغة لبدء الترجمة'
                      : 'Select a language to start translation'}
                  </div>
                )}
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
