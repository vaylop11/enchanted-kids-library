
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Clock, FileText, Share, Send, DownloadCloud, ChevronUp, ChevronDown, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getPDFById,
  addChatMessageToPDF,
  savePDF,
  deletePDFById,
  ChatMessage,
  UploadedPDF,
  getChatMessagesForPDF
} from '@/services/pdfStorage';
import { generateChatResponse } from '@/services/geminiService';
import { extractTextFromPDF } from '@/services/pdfExtractor';
import { Badge } from '@/components/ui/badge';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { language, direction } = useLanguage();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [showPdfControls, setShowPdfControls] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [pdf, setPdf] = useState<UploadedPDF | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pdfContent, setPdfContent] = useState<string>('');
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const loadPdf = async () => {
      // Load PDF from storage
      const loadedPdf = await getPDFById(id);
      if (!loadedPdf) {
        toast.error(language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF not found');
        navigate('/pdfs');
        return;
      }

      setPdf(loadedPdf);
      
      // Load chat messages
      const messages = await getChatMessagesForPDF(id);
      setChatMessages(messages);
      
      // Check if PDF data is missing
      if (!loadedPdf.dataUrl && !loadedPdf.storageUrl && !loadedPdf.googleViewerUrl) {
        setPdfError(language === 'ar' 
          ? 'تعذر تحميل بيانات PDF بسبب قيود التخزين' 
          : 'Could not load PDF data due to storage limitations');
        toast.error(language === 'ar' 
          ? 'تعذر تحميل بيانات PDF بسبب قيود التخزين' 
          : 'Could not load PDF data due to storage limitations');
        setIsLoadingPdf(false);
      }
      
      // Try to extract text content for AI context
      if (loadedPdf.dataUrl || loadedPdf.storageUrl) {
        try {
          const text = await extractTextFromPDF(loadedPdf.dataUrl || loadedPdf.storageUrl || '');
          setPdfContent(text);
        } catch (error) {
          console.error('Error extracting PDF text:', error);
        }
      }
    };
    
    loadPdf();
    
    // Simulate loading to ensure animations trigger correctly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [id, navigate, language, retryCount]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoadingPdf(false);
    setPdfError(null);
    
    // Update page count if needed
    if (pdf && pdf.pageCount !== numPages) {
      const updatedPdf = { ...pdf, pageCount: numPages };
      setPdf(updatedPdf);
      savePDF(updatedPdf);
    }
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError(language === 'ar'
      ? 'فشل في تحميل ملف PDF. قد يكون الملف تالفًا أو غير متوافق.'
      : 'Failed to load PDF. The file may be corrupted or incompatible.');
    setIsLoadingPdf(false);
  };

  const handleDeletePDF = () => {
    if (!id) return;
    
    if (window.confirm(language === 'ar' 
      ? 'هل أنت متأكد من أنك تريد حذف هذا الملف؟' 
      : 'Are you sure you want to delete this PDF?')) {
      
      deletePDFById(id).then(success => {
        if (success) {
          navigate('/pdfs');
        }
      });
    }
  };

  const scrollToLatestMessage = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToLatestMessage();
  }, [chatMessages]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pdf ? pdf.title : '',
        text: pdf ? pdf.summary : '',
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast(language === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard');
    }
  };

  const handlePrevPage = () => {
    setPageNumber(prevPage => Math.max(prevPage - 1, 1));
  };

  const handleNextPage = () => {
    if (numPages) {
      setPageNumber(prevPage => Math.min(prevPage + 1, numPages));
    }
  };

  const handleZoomIn = () => {
    setPdfScale(prev => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setPdfScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleRetryLoading = () => {
    setIsLoadingPdf(true);
    setPdfError(null);
    setRetryCount(prev => prev + 1);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !id || !pdf) return;

    // Add user message to chat
    const userMessage: Omit<ChatMessage, 'id'> = {
      content: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    try {
      const savedMessage = await addChatMessageToPDF(id, userMessage);
      if (savedMessage) {
        // Update local state
        setChatMessages(prev => [...prev, savedMessage]);
      }
      
      setChatInput('');
      setIsGeneratingResponse(true);

      // Generate AI response using Gemini
      const aiResponse = await generateChatResponse({ 
        pdfId: id, 
        prompt: chatInput, 
        pdfContent: pdfContent 
      });
      
      if (aiResponse) {
        // AI response is already saved to the database by the service
        setChatMessages(prev => [...prev, aiResponse]);
      } else {
        // Fallback if the Gemini API fails
        const fallbackMessage: Omit<ChatMessage, 'id'> = {
          content: "I'm sorry, I couldn't generate a response at this time. Please try again later.",
          isUser: false,
          timestamp: new Date()
        };
        
        const savedFallbackMessage = await addChatMessageToPDF(id, fallbackMessage);
        if (savedFallbackMessage) {
          setChatMessages(prev => [...prev, savedFallbackMessage]);
        }
      }
    } catch (error) {
      console.error('Error in chat flow:', error);
      toast.error(language === 'ar' 
        ? 'حدث خطأ أثناء معالجة طلبك' 
        : 'Error processing your request');
    } finally {
      setIsGeneratingResponse(false);
    }
  };
  
  // Render the PDF viewer based on available options
  const renderPDFViewer = () => {
    if (isLoadingPdf) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4" />
          <p className="text-lg font-medium mb-2">
            {language === 'ar' ? 'جاري تحميل الملف...' : 'Loading PDF...'}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
          </p>
        </div>
      );
    }
    
    if (pdfError) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          <h2 className="text-xl font-medium mb-2 text-center">
            {language === 'ar' ? 'تعذر تحميل الملف' : 'Failed to load PDF'}
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            {pdfError}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetryLoading}>
              {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
            <Button onClick={() => navigate('/pdfs')}>
              {language === 'ar' ? 'العودة إلى قائمة الملفات' : 'Back to PDF List'}
            </Button>
          </div>
        </div>
      );
    }
    
    // If we have a Google Docs viewer URL, use it
    if (pdf?.googleViewerUrl) {
      return (
        <div className="w-full h-full min-h-[60vh] bg-white">
          <iframe
            src={pdf.googleViewerUrl}
            className="w-full h-full min-h-[60vh] border-0"
            title={`PDF Viewer: ${pdf.title}`}
            sandbox="allow-scripts allow-same-origin allow-forms"
            loading="lazy"
          />
        </div>
      );
    }
    
    // If we have a storage URL but no Google viewer URL
    if (pdf?.storageUrl && !pdf?.googleViewerUrl) {
      const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdf.storageUrl)}&embedded=true`;
      return (
        <div className="w-full h-full min-h-[60vh] bg-white">
          <iframe
            src={googleViewerUrl}
            className="w-full h-full min-h-[60vh] border-0"
            title={`PDF Viewer: ${pdf.title}`}
            sandbox="allow-scripts allow-same-origin allow-forms"
            loading="lazy"
          />
        </div>
      );
    }
    
    // If we have a data URL but not storage or Google URLs
    if (pdf?.dataUrl && !pdf?.storageUrl && !pdf?.googleViewerUrl) {
      return (
        <Document
          file={pdf.dataUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={handleDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-full w-full">
              <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-full w-full">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2">
                {language === 'ar' ? 'فشل تحميل الملف' : 'Failed to load PDF'}
              </p>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                {language === 'ar' 
                  ? 'قد تكون هناك مشكلة في تنسيق الملف أو أن الملف قد يكون كبيرًا جدًا للعرض.' 
                  : 'There might be an issue with the file format or the file may be too large to display.'}
              </p>
              <Button variant="outline" onClick={handleRetryLoading}>
                {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
              </Button>
            </div>
          }
        >
          <Page 
            pageNumber={pageNumber} 
            scale={pdfScale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            error={
              <div className="flex flex-col items-center justify-center p-6">
                <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
                <p className="text-sm text-center">
                  {language === 'ar' ? 'خطأ في عرض الصفحة' : 'Error rendering page'}
                </p>
              </div>
            }
          />
        </Document>
      );
    }
    
    // No PDF data available
    return (
      <div className="flex flex-col items-center justify-center h-full w-full">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-medium mb-2 text-center">
          {language === 'ar' ? 'لا توجد بيانات PDF' : 'No PDF Data Available'}
        </h2>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {language === 'ar' 
            ? 'لم يتم تخزين بيانات PDF بسبب قيود التخزين. حاول حذف بعض الملفات القديمة وتحميل هذا الملف مرة أخرى.'
            : 'PDF data was not stored due to storage limitations. Try deleting some older PDFs and upload this file again.'}
        </p>
        <Button onClick={() => navigate('/pdfs')}>
          {language === 'ar' ? 'العودة إلى قائمة الملفات' : 'Back to PDF List'}
        </Button>
      </div>
    );
  };
  
  if (!pdf) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-medium mb-2">
          {language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF Not Found'}
        </h1>
        <Link 
          to="/pdfs" 
          className="text-primary hover:underline"
        >
          {language === 'ar' ? 'العودة إلى قائمة الملفات' : 'Return to PDF List'}
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex justify-between items-center mb-6">
            <Link 
              to="/pdfs" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة إلى قائمة الملفات' : 'Back to PDFs'}
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={language === 'ar' ? 'مشاركة الملف' : 'Share file'}
              >
                <Share className="h-5 w-5" />
              </button>
              {(pdf.dataUrl || pdf.storageUrl) && (
                <a
                  href={pdf.storageUrl || pdf.dataUrl}
                  download={pdf.title}
                  className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label={language === 'ar' ? 'تنزيل الملف' : 'Download file'}
                >
                  <DownloadCloud className="h-5 w-5" />
                </a>
              )}
              <button
                onClick={handleDeletePDF}
                className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                aria-label={language === 'ar' ? 'حذف الملف' : 'Delete file'}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row gap-6">
            {/* PDF Viewer */}
            <div className="lg:w-2/3 bg-card rounded-xl border border-border overflow-hidden shadow-sm">
              <div className="flex justify-between items-center p-4 border-b">
                <div>
                  <h1 className="font-display text-xl font-medium truncate">
                    {pdf.title}
                  </h1>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {pdf.fileSize}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pdf.pageCount || '?'} {language === 'ar' ? 'صفحات' : 'pages'}
                    </Badge>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPdfControls(!showPdfControls)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  {showPdfControls ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              {showPdfControls && !pdf.googleViewerUrl && (
                <div className="flex flex-wrap justify-between items-center p-4 bg-muted/20 border-b">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePrevPage}
                        disabled={pageNumber <= 1 || pdfError !== null || (!pdf.dataUrl && !pdf.storageUrl)}
                      >
                        {language === 'ar' ? 'السابق' : 'Prev'}
                      </Button>
                      <span className="text-sm">
                        {language === 'ar' 
                          ? `${pageNumber} من ${numPages || '?'}`
                          : `${pageNumber} of ${numPages || '?'}`
                        }
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNextPage}
                        disabled={!numPages || pageNumber >= numPages || pdfError !== null || (!pdf.dataUrl && !pdf.storageUrl)}
                      >
                        {language === 'ar' ? 'التالي' : 'Next'}
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleZoomOut}
                        disabled={pdfError !== null || (!pdf.dataUrl && !pdf.storageUrl)}
                      >-</Button>
                      <span className="text-sm">{Math.round(pdfScale * 100)}%</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleZoomIn}
                        disabled={pdfError !== null || (!pdf.dataUrl && !pdf.storageUrl)}
                      >+</Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'تم التحميل' : 'Uploaded'}: {pdf.uploadDate}
                  </div>
                </div>
              )}
              
              <div className="p-0 overflow-auto bg-muted/10 min-h-[60vh] flex justify-center">
                {renderPDFViewer()}
              </div>
            </div>
            
            {/* Chat Interface */}
            <div className="lg:w-1/3 bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-display text-lg font-medium">
                  {language === 'ar' ? 'دردشة مع هذا الملف' : 'Chat with this PDF'}
                </h2>
                <button 
                  onClick={() => setShowChat(!showChat)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  {showChat ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              {showChat && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-medium mb-2">
                          {language === 'ar' ? 'اطرح سؤالاً حول هذا الملف' : 'Ask a question about this PDF'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' 
                            ? 'يمكنك طرح أسئلة حول محتوى الملف والحصول على إجابات من الذكاء الاصطناعي'
                            : 'You can ask questions about the content of the PDF and get AI-powered answers using Gemini Flash 2.0'
                          }
                        </p>
                      </div>
                    ) : (
                      chatMessages.map(message => (
                        <div 
                          key={message.id}
                          className={cn(
                            "flex flex-col p-3 rounded-lg max-w-[80%]",
                            message.isUser 
                              ? "ml-auto bg-primary text-primary-foreground" 
                              : "mr-auto bg-muted"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 self-end">
                            {message.timestamp instanceof Date 
                              ? message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            }
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <form onSubmit={handleChatSubmit} className="p-4 border-t mt-auto">
                    <div className="relative">
                      <Textarea
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                        className="pr-12 resize-none"
                        rows={3}
                        disabled={pdfError !== null || (!pdf.dataUrl && !pdf.storageUrl && !pdf.googleViewerUrl) || isGeneratingResponse}
                      />
                      <Button 
                        type="submit" 
                        size="icon" 
                        className="absolute bottom-2 right-2"
                        disabled={!chatInput.trim() || pdfError !== null || (!pdf.dataUrl && !pdf.storageUrl && !pdf.googleViewerUrl) || isGeneratingResponse}
                      >
                        {isGeneratingResponse ? (
                          <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-6 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="text-sm">
            {language === 'ar' 
              ? `© ${new Date().getFullYear()} أداة دردشة PDF. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} PDF Chat Tool. All rights reserved.`
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PDFViewer;
