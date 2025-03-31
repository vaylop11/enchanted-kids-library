
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Loader2, Plus, Upload, Download, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatInterface from '@/components/ChatInterface';
import {
  getPDFById as getLocalPDFById,
  UploadedPDF,
  addChatMessageToPDF,
  savePDF,
} from '@/services/pdfStorage';
import {
  getSupabasePDFById,
  updateSupabasePDF,
  createSupabaseChat,
  getSupabaseChatsByPdfId,
  deleteSupabaseChatMessage,
  deleteAllChatMessagesForPDF,
  SupabasePDF,
  SupabaseChat,
} from '@/services/pdfSupabaseService';
import { analyzePDF, AnalysisProgress } from '@/services/pdfAnalysisService';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const { id: pdfId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [pdf, setPdf] = useState<UploadedPDF | SupabasePDF | null>(null);
  const [isSupabasePDF, setIsSupabasePDF] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [messages, setMessages] = useState<SupabaseChat[]>([]);
  const [pdfTitle, setPdfTitle] = useState('');
  const debouncedPdfTitle = useDebounce(pdfTitle, 500);
  
  const initialAnalysisProgress: AnalysisProgress = {
    stage: "waiting",
    progress: 0,
    message: "Waiting to start analysis...",
    summary: 0,
    keywords: 0,
    questions: 0
  };
  
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>(initialAnalysisProgress);
  
  const { data: supabasePdf, refetch: refetchSupabasePdf } = useQuery({
    queryKey: ['supabasePdf', pdfId],
    queryFn: () => getSupabasePDFById(pdfId as string),
    enabled: !!pdfId,
    retry: false,
  });
  
  const { data: supabaseChats, refetch: refetchSupabaseChats } = useQuery({
    queryKey: ['supabaseChats', pdfId],
    queryFn: () => getSupabaseChatsByPdfId(pdfId as string),
    enabled: !!pdfId && isSupabasePDF,
    retry: false,
    onSuccess: (data) => {
      setIsLoadingMessages(false);
      setMessages(data);
    },
    onError: () => {
      setIsLoadingMessages(false);
      toast.error(language === 'ar' ? 'فشل في تحميل الرسائل' : 'Failed to load messages');
    }
  });
  
  useEffect(() => {
    if (!user) {
      navigate('/signin');
      return;
    }
    
    const loadPDF = async () => {
      setIsLoading(true);
      setIsLoadingMessages(true);
      
      try {
        if (pdfId?.startsWith('temp_')) {
          const localPdf = getLocalPDFById(pdfId);
          if (localPdf) {
            setPdf(localPdf);
            setIsSupabasePDF(false);
            setNumPages(localPdf.pageCount || 0);
            setPdfTitle(localPdf.title);
            setIsLoadingMessages(false);
          } else {
            toast.error(language === 'ar' ? 'لم يتم العثور على الملف' : 'File not found');
            navigate('/pdfs');
          }
        } else {
          if (supabasePdf) {
            setPdf(supabasePdf);
            setIsSupabasePDF(true);
            setNumPages(supabasePdf.pageCount || 0);
            setPdfTitle(supabasePdf.title);
            refetchSupabaseChats();
          } else {
            toast.error(language === 'ar' ? 'لم يتم العثور على الملف' : 'File not found');
            navigate('/pdfs');
          }
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast.error(language === 'ar' ? 'فشل في تحميل الملف' : 'Failed to load PDF');
        navigate('/pdfs');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPDF();
  }, [pdfId, navigate, language, user, supabasePdf, refetchSupabaseChats]);
  
  useEffect(() => {
    if (debouncedPdfTitle && pdf && debouncedPdfTitle !== pdf.title) {
      const updateTitle = async () => {
        try {
          if (isSupabasePDF) {
            const updated = await updateSupabasePDF(pdfId as string, { title: debouncedPdfTitle });
            if (updated) {
              setPdf(prevPdf => ({ ...prevPdf as SupabasePDF, title: debouncedPdfTitle }));
              toast.success(language === 'ar' ? 'تم تحديث العنوان' : 'Title updated');
              refetchSupabasePdf();
            } else {
              toast.error(language === 'ar' ? 'فشل في تحديث العنوان' : 'Failed to update title');
            }
          }
        } catch (error) {
          console.error('Error updating PDF title:', error);
          toast.error(language === 'ar' ? 'فشل في تحديث العنوان' : 'Failed to update title');
        }
      };
      
      updateTitle();
    }
  }, [debouncedPdfTitle, pdf, pdfId, isSupabasePDF, language, refetchSupabasePdf]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };
  
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => Math.max(1, Math.min(prevPageNumber + offset, numPages || 1)));
  };
  
  const zoomIn = () => {
    setScale(prevScale => Math.min(3, prevScale + 0.25));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(0.5, prevScale - 0.25));
  };
  
  const handleSendMessage = async (messageContent: string) => {
    if (!pdfId || !user) return;
    
    setIsWaitingForResponse(true);
    
    try {
      if (isSupabasePDF) {
        const newChat = await createSupabaseChat({
          pdfId: pdfId,
          content: messageContent,
          isUser: true,
          timestamp: new Date(),
          userId: user.id
        });
        
        if (newChat) {
          setMessages(prevMessages => [...prevMessages, newChat]);
          refetchSupabaseChats();
        } else {
          throw new Error('Failed to create chat message');
        }
      } else {
        const newMessage = addChatMessageToPDF(pdfId, {
          content: messageContent,
          isUser: true,
          timestamp: new Date()
        });
        
        if (newMessage) {
          // Cast the local message to match SupabaseChat structure
          const convertedMessage: SupabaseChat = {
            id: newMessage.id,
            pdfId: pdfId,
            content: newMessage.content,
            isUser: newMessage.isUser,
            timestamp: newMessage.timestamp,
            userId: user.id
          };
          setMessages(prevMessages => [...prevMessages, convertedMessage]);
        } else {
          throw new Error('Failed to create chat message');
        }
      }
      
      // Simulate AI response (replace with actual AI integration)
      setTimeout(() => {
        const aiResponse = language === 'ar'
          ? 'هذا رد تجريبي من الذكاء الاصطناعي.'
          : 'This is a dummy response from the AI.';
        
        if (isSupabasePDF) {
          createSupabaseChat({
            pdfId: pdfId,
            content: aiResponse,
            isUser: false,
            timestamp: new Date(),
            userId: 'ai'
          }).then(aiChat => {
            if (aiChat) {
              setMessages(prevMessages => [...prevMessages, aiChat]);
              refetchSupabaseChats();
            } else {
              throw new Error('Failed to create AI chat message');
            }
          });
        } else {
          const aiMessage = addChatMessageToPDF(pdfId, {
            content: aiResponse,
            isUser: false,
            timestamp: new Date()
          });
          
          // Convert local message to SupabaseChat format
          if (aiMessage) {
            const convertedAiMessage: SupabaseChat = {
              id: 'ai-' + Date.now(),
              pdfId: pdfId,
              content: aiResponse,
              isUser: false,
              timestamp: new Date(),
              userId: 'ai'
            };
            setMessages(prevMessages => [...prevMessages, convertedAiMessage]);
          }
        }
        
        setIsWaitingForResponse(false);
      }, 1500);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      setIsWaitingForResponse(false);
    }
  };
  
  const handleClearMessages = () => {
    setMessages([]);
  };
  
  const handleGenerateSummary = () => {
    toast.info(language === 'ar' ? 'غير متوفر حاليا' : 'Not available yet');
  };
  
  const handleTranslate = () => {
    toast.info(language === 'ar' ? 'غير متوفر حاليا' : 'Not available yet');
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      setIsDeletingMessage(true);
      
      // If PDF is from Supabase, delete message from Supabase first
      if (isSupabasePDF) {
        const success = await deleteSupabaseChatMessage(messageId);
        if (!success) {
          toast.error(language === 'ar' 
            ? 'فشل في حذف الرسالة' 
            : 'Failed to delete message');
          return;
        }
      }
      
      // Then delete from local storage if applicable
      if (!isSupabasePDF && pdfId && pdf) {
        const updatedMessages = [...messages].filter(msg => msg.id !== messageId);
        
        // Update the PDF with filtered messages
        const updatedPdf = {
          ...pdf as UploadedPDF,
          chatMessages: updatedMessages
        };
        
        // Save the updated PDF back to storage
        savePDF(updatedPdf);
        
        // Update state
        setMessages(updatedMessages);
        toast.success(language === 'ar' 
          ? 'تم حذف الرسالة بنجاح' 
          : 'Message deleted successfully');
      }
      
      // Update state for Supabase PDFs
      if (isSupabasePDF) {
        setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
        toast.success(language === 'ar' 
          ? 'تم حذف الرسالة بنجاح' 
          : 'Message deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(language === 'ar' 
        ? 'حدث خطأ أثناء حذف الرسالة' 
        : 'Error occurred while deleting message');
    } finally {
      setIsDeletingMessage(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  
  if (!pdf) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <XCircle className="h-6 w-6 text-red-500 mr-2" />
        {language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF not found'}
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 flex flex-col h-screen">
      <header className="mb-4 flex items-center justify-between">
        <Button onClick={() => navigate('/pdfs')} variant="ghost">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'ar' ? 'العودة إلى ملفاتي' : 'Back to My PDFs'}
        </Button>
        
        <Input
          type="text"
          placeholder={language === 'ar' ? 'أدخل عنوان الملف...' : 'Enter PDF title...'}
          value={pdfTitle}
          onChange={(e) => setPdfTitle(e.target.value)}
          className="max-w-md"
        />
      </header>
      
      <main className="flex flex-col lg:flex-row flex-grow">
        <section className="lg:w-2/3 flex flex-col">
          <div className="relative">
            <Document
              file={isSupabasePDF ? (pdf as SupabasePDF).fileUrl : (pdf as UploadedPDF).dataUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full"
            >
              <Page pageNumber={pageNumber} scale={scale} />
            </Document>
            
            <div className="absolute top-2 left-2 bg-secondary/80 text-secondary-foreground rounded-md p-2 shadow-md">
              <p className="text-sm">
                {language === 'ar'
                  ? `صفحة ${pageNumber} من ${numPages}`
                  : `Page ${pageNumber} of ${numPages}`}
              </p>
            </div>
          </div>
          
          <div className="flex justify-center items-center mt-4 space-x-2">
            <Button onClick={() => changePage(-1)} disabled={pageNumber <= 1}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button onClick={() => changePage(1)} disabled={pageNumber >= (numPages || 0)}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button onClick={zoomIn}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={zoomOut}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </section>
        
        <Separator orientation="vertical" className="hidden lg:flex mx-4" />
        
        <section className="lg:w-1/3 flex flex-col">
          <ChatInterface
            messages={messages}
            isLoadingMessages={isLoadingMessages}
            isAnalyzing={isAnalyzing}
            isWaitingForResponse={isWaitingForResponse}
            analysisProgress={analysisProgress}
            language={language}
            onSendMessage={handleSendMessage}
            onClearMessages={handleClearMessages}
            onGenerateSummary={handleGenerateSummary}
            onTranslate={handleTranslate}
            onDeleteMessage={handleDeleteMessage}
            isDeletingMessage={isDeletingMessage}
          />
        </section>
      </main>
      
      <footer className="mt-8 text-center text-muted-foreground">
        <p className="text-sm">
          {language === 'ar'
            ? `© ${new Date().getFullYear()} أداة دردشة PDF. جميع الحقوق محفوظة.`
            : `© ${new Date().getFullYear()} PDF Chat Tool. All rights reserved.`}
        </p>
      </footer>
    </div>
  );
};

export default PDFViewer;
