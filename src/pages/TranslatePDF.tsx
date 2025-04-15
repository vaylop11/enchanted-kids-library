import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, FileText, Languages, Loader2 } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { getPDFById, getUserPDFs, SupabasePDF } from '@/services/pdfSupabaseService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { extractTextFromPDF, AnalysisProgress } from '@/services/pdfAnalysisService';
import { translateText, supportedLanguages } from '@/services/translationService';
import { Separator } from '@/components/ui/separator';
import SEO from '@/components/SEO';
import { PDF } from '@/types/pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const TranslatePDF = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  
  const [userPDFs, setUserPDFs] = useState<SupabasePDF[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [extractProgress, setExtractProgress] = useState<AnalysisProgress>({
    stage: 'waiting',
    progress: 0,
    message: 'Ready to extract content',
  });
  
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [isTempPdf, setIsTempPdf] = useState(false);

  useEffect(() => {
    const loadUserPDFs = async () => {
      if (!user) return;
      try {
        const pdfs = await getUserPDFs(user.id);
        setUserPDFs(pdfs);
      } catch (error) {
        console.error('Error loading PDFs:', error);
        toast.error(language === 'ar' ? 'فشل في تحميل الملفات' : 'Failed to load PDFs');
      }
    };

    loadUserPDFs();
  }, [user]);

  useEffect(() => {
    if (!id) return;

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
        navigate('/pdfs');
        return;
      } else {
        const loadedPdf = await getPDFById(id);
        if (loadedPdf) {
          setPdfTitle(loadedPdf.title);
          
          if (loadedPdf.fileUrl) {
            setPdfUrl(loadedPdf.fileUrl);
            setIsLoaded(true);
          } else {
            toast.error(language === 'ar' 
              ? 'تعذر تحميل بيانات PDF بسبب قيود التخزين' 
              : 'Could not load PDF data due to storage limitations');
            navigate('/pdfs');
          }
        } else {
          toast.error(language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF not found');
          navigate('/pdfs');
        }
      }
    };

    loadPdf();
  }, [id, navigate, language]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (numPages || 1)) {
      setPageNumber(newPage);
    }
  };

  const updateExtractProgress = (progress: AnalysisProgress) => {
    setExtractProgress(progress);
  };

  const handleExtractText = async () => {
    if (!pdfUrl || !id) return;
    
    setIsExtracting(true);
    setSourceText('');
    setTranslatedText('');
    setDetectedLanguage(null);
    
    try {
      const extractedText = await extractTextFromPDF(pdfUrl, id, updateExtractProgress);
      setSourceText(extractedText);
    } catch (error) {
      console.error('Error extracting text from PDF:', error);
      toast.error(language === 'ar' 
        ? 'فشل في استخراج النص من الملف' 
        : 'Failed to extract text from the PDF');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleTranslate = async () => {
    if (!sourceText || !targetLanguage) return;
    
    setIsTranslating(true);
    setTranslatedText('');
    
    try {
      const result = await translateText(sourceText, targetLanguage);
      setTranslatedText(result.translatedText);
      if (result.detectedSourceLanguage) {
        setDetectedLanguage(result.detectedSourceLanguage);
      }
      toast.success(language === 'ar'
        ? 'تمت الترجمة بنجاح'
        : 'Translation completed successfully');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error(language === 'ar'
        ? 'فشل في ترجمة النص'
        : 'Failed to translate text');
    } finally {
      setIsTranslating(false);
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen flex flex-col">
        <SEO 
          title={language === 'ar' ? 'ترجمة ملفات PDF' : 'Translate PDFs'}
          description={language === 'ar' 
            ? 'اختر ملف PDF لترجمته إلى لغات متعددة'
            : 'Choose a PDF file to translate into multiple languages'}
        />
        <Navbar />
        <main className="flex-1 pt-24 pb-10">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="flex items-center gap-2 mb-8">
              <Languages className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold">
                {language === 'ar' ? 'اختر ملفاً للترجمة' : 'Choose a PDF to Translate'}
              </h1>
            </div>
            
            {userPDFs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  {language === 'ar' ? 'لا توجد ملفات PDF' : 'No PDFs Found'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'ar' 
                    ? 'قم بتحميل ملف PDF للبدء في الترجمة'
                    : 'Upload a PDF file to start translating'}
                </p>
                <Button asChild>
                  <Link to="/pdfs">
                    {language === 'ar' ? 'تحميل ملف PDF' : 'Upload PDF'}
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userPDFs.map((pdf) => (
                  <Link 
                    key={pdf.id}
                    to={`/translate/${pdf.id}`}
                    className="block group hover:no-underline"
                  >
                    <div className="border rounded-lg p-4 transition-shadow hover:shadow-md">
                      <div className="aspect-[4/3] mb-4 bg-muted/20 rounded-md flex items-center justify-center">
                        {pdf.thumbnail ? (
                          <img
                            src={pdf.thumbnail}
                            alt={pdf.title}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <FileText className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-medium text-foreground group-hover:text-primary truncate mb-1">
                        {pdf.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {pdf.page_count} {language === 'ar' ? 'صفحات' : 'pages'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title={`${language === 'ar' ? 'ترجمة: ' : 'Translate: '} ${pdfTitle || 'PDF'}`}
        description={language === 'ar' 
          ? `ترجمة ملف PDF "${pdfTitle || ''}" إلى لغات متعددة` 
          : `Translate PDF "${pdfTitle || ''}" to multiple languages`}
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
            
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold">
                {language === 'ar' ? 'ترجمة الملف' : 'Translate PDF'}
              </h1>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
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
            
            <div className="flex flex-col">
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-4">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                      {language === 'ar' ? 'استخراج النص' : 'Extract Text'}
                    </h2>
                    <Button 
                      onClick={handleExtractText}
                      disabled={isExtracting || !isLoaded}
                      size="sm"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          {language === 'ar' ? 'جار الاستخراج...' : 'Extracting...'}
                        </>
                      ) : (
                        language === 'ar' ? 'استخراج النص' : 'Extract Text'
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar'
                      ? 'استخرج النص من الصفحة الحالية لترجمته'
                      : 'Extract text from the current page to translate it'}
                  </p>
                </div>
                
                {isExtracting ? (
                  <div className="p-4 bg-muted/10 min-h-[20vh]">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="h-10 w-10 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4" />
                      <p className="text-sm mb-2">
                        {extractProgress.message}
                      </p>
                      <div className="w-full max-w-xs bg-muted/30 rounded-full h-2.5 dark:bg-muted/30 mb-4">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${extractProgress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <Textarea
                      placeholder={language === 'ar'
                        ? 'انقر على "استخراج النص" لاستخراج محتوى الصفحة الحالية'
                        : 'Click "Extract Text" to extract content from the current page'}
                      className="min-h-[20vh]"
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-lg">
                      {language === 'ar' ? 'ترجمة النص' : 'Translate Text'}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar'
                      ? 'اختر اللغة الهدف وترجم النص'
                      : 'Choose target language and translate the text'}
                  </p>
                </div>
                
                <div className="p-4 space-y-4">
                  <div className="flex flex-col space-y-1.5 mb-4">
                    <Label htmlFor="language">
                      {language === 'ar' ? 'اللغة المستهدفة' : 'Target Language'}
                    </Label>
                    <Select
                      value={targetLanguage}
                      onValueChange={setTargetLanguage}
                    >
                      <SelectTrigger>
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
                  </div>
                  
                  <Button 
                    onClick={handleTranslate}
                    disabled={isTranslating || !sourceText}
                    className="w-full"
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {language === 'ar' ? 'جار الترجمة...' : 'Translating...'}
                      </>
                    ) : (
                      language === 'ar' ? 'ترجم النص' : 'Translate Text'
                    )}
                  </Button>
                  
                  {detectedLanguage && (
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' 
                        ? `اللغة المكتشفة: ${detectedLanguage}`
                        : `Detected language: ${detectedLanguage}`}
                    </p>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="translation">
                      {language === 'ar' ? 'النص المترجم' : 'Translated Text'}
                    </Label>
                    <Textarea
                      id="translation"
                      className="min-h-[20vh]"
                      value={translatedText}
                      readOnly
                      placeholder={language === 'ar'
                        ? 'النص المترجم سيظهر هنا'
                        : 'Translated text will appear here'}
                    />
                  </div>
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
