import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, FileText, Share, ChevronUp, ChevronDown, AlertTriangle, Trash2, Languages, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import { ChatMessageBubble } from '@/components/ui/chat-message-bubble';
import ScrollablePDFViewer from '@/components/ui/scrollable-pdf-viewer';
import { pdfjs } from 'react-pdf';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getPDFById,
  addChatMessageToPDF,
  savePDF,
  deletePDFById,
  ChatMessage,
  UploadedPDF
} from '@/services/pdfStorage';
import {
  getPDFById as getSupabasePDFById,
  getChatMessagesForPDF,
  addChatMessageToPDF as addSupabaseChatMessage,
  updatePDFMetadata,
  deletePDF as deleteSupabasePDF
} from '@/services/pdfSupabaseService';
import {
  extractTextFromPDF,
  analyzePDFWithGemini,
  AnalysisProgress
} from '@/services/pdfAnalysisService';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPdfControls, setShowPdfControls] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showChat, setShowChat] = useState(true);
  const [pdf, setPdf] = useState<UploadedPDF | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isTempPdf, setIsTempPdf] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [pdfTextContent, setPdfTextContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: 'extracting',
    progress: 0,
    message: 'Preparing to analyze PDF...'
  });
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  // Chat suggestions based on PDF content
  const chatSuggestions = [
    language === 'ar' ? 'ما هو الموضوع الرئيسي لهذا المستند؟' : 'What is the main topic of this document?',
    language === 'ar' ? 'لخص النقاط المهمة' : 'Summarize the key points',
    language === 'ar' ? 'ما هي الاستنتاجات الرئيسية؟' : 'What are the main conclusions?',
    language === 'ar' ? 'اشرح الأقسام المعقدة' : 'Explain the complex sections',
  ];

  // Load PDF and messages on component mount
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }

    const loadPdf = async () => {
      console.log('Loading PDF with ID:', id);
      
      if (id.startsWith('temp-') || window.location.pathname.includes('/pdf/temp/')) {
        setIsTempPdf(true);
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (parsedData.fileData && parsedData.fileData.id === id) {
              setPdf(parsedData.fileData);
              setChatMessages(parsedData.fileData.chatMessages || []);
              setMessagesLoaded(true);
              setIsLoadingPdf(false);
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

      // Try loading from local storage first
      const loadedPdf = getPDFById(id);
      if (loadedPdf) {
        console.log('PDF loaded from local storage:', loadedPdf);
        setPdf(loadedPdf);
        
        // Load messages from local storage
        if (loadedPdf.chatMessages && loadedPdf.chatMessages.length > 0) {
          setChatMessages(loadedPdf.chatMessages);
          console.log('Loaded messages from local storage:', loadedPdf.chatMessages.length);
        }
        
        if (!loadedPdf.dataUrl) {
          if (user) {
            await tryLoadFromSupabase(id);
          } else {
            setPdfError(language === 'ar' 
              ? 'تعذر تحميل بيانات PDF بسبب قيود التخزين' 
              : 'Could not load PDF data due to storage limitations');
            toast.error(language === 'ar' 
              ? 'تعذر تحميل بيانات PDF بسبب قيود التخزين' 
              : 'Could not load PDF data due to storage limitations');
            setIsLoadingPdf(false);
          }
        } else {
          setIsLoadingPdf(false);
        }
        
        // If user is logged in, also try to load messages from Supabase
        if (user && !messagesLoaded) {
          await loadMessagesFromSupabase(id);
        } else {
          setMessagesLoaded(true);
        }
      } else {
        // PDF not in local storage, try Supabase
        await tryLoadFromSupabase(id);
      }
    };

    const tryLoadFromSupabase = async (pdfId: string) => {
      if (!user) {
        toast.error(language === 'ar' ? 'يرجى تسجيل الدخول لعرض هذا الملف' : 'Please sign in to view this PDF');
        navigate('/login');
        return;
      }
      
      try {
        console.log('Trying to load PDF from Supabase with ID:', pdfId);
        const supabasePdf = await getSupabasePDFById(pdfId);
        
        if (supabasePdf && supabasePdf.fileUrl) {
          console.log('Successfully loaded PDF from Supabase:', supabasePdf);
          
          const newPdf: UploadedPDF = {
            id: supabasePdf.id,
            title: supabasePdf.title,
            summary: supabasePdf.summary,
            uploadDate: supabasePdf.uploadDate,
            pageCount: supabasePdf.pageCount,
            fileSize: supabasePdf.fileSize,
            dataUrl: supabasePdf.fileUrl,
            chatMessages: []
          };
          
          setPdf(newPdf);
          setIsLoadingPdf(false);
          
          // Load messages from Supabase
          await loadMessagesFromSupabase(pdfId);
        } else {
          console.error('PDF data not found in Supabase');
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

    const loadMessagesFromSupabase = async (pdfId: string) => {
      if (!user) return;
      
      setIsLoadingMessages(true);
      try {
        console.log('Loading messages from Supabase for PDF:', pdfId);
        const messages = await getChatMessagesForPDF(pdfId);
        if (messages && messages.length > 0) {
          const convertedMessages: ChatMessage[] = messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.isUser,
            timestamp: msg.timestamp
          }));
          
          console.log('Loaded messages from Supabase:', convertedMessages.length);
          setChatMessages(convertedMessages);
        }
      } catch (error) {
        console.error('Error loading messages from Supabase:', error);
      } finally {
        setIsLoadingMessages(false);
        setMessagesLoaded(true);
      }
    };

    loadPdf();
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, [id, navigate, language, retryCount, user]);

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoadingPdf(false);
    setPdfError(null);
    
    if (pdf && pdf.pageCount !== numPages) {
      const updatedPdf = { ...pdf, pageCount: numPages };
      setPdf(updatedPdf);
      
      if (!isTempPdf) {
        if (user) {
          updatePDFMetadata(updatedPdf.id, { pageCount: numPages });
        } else {
          savePDF(updatedPdf);
        }
      } else if (updatedPdf.id.startsWith('temp-')) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            parsedData.fileData.pageCount = numPages;
            sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
          } catch (error) {
            console.error('Error updating temporary PDF page count:', error);
          }
        }
      }
    }
  };

  const handleDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setPdfError(language === 'ar'
      ? 'فشل في تحميل ملف PDF. قد يكون الملف تالفًا أو غير متوافق.'
      : 'Failed to load PDF. The file may be corrupted or incompatible.');
    setIsLoadingPdf(false);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleDeletePDF = () => {
    if (!id) return;
    
    if (window.confirm(language === 'ar' 
      ? 'هل أنت متأكد من أنك تريد حذف هذا الملف؟' 
      : 'Are you sure you want to delete this PDF?')) {
      
      if (isTempPdf) {
        sessionStorage.removeItem('tempPdfFile');
        navigate('/');
        return;
      }
      
      if (user) {
        deleteSupabasePDF(id).then(success => {
          if (success) {
            navigate('/pdfs');
          }
        });
      } else {
        if (deletePDFById(id)) {
          navigate('/pdfs');
        }
      }
    }
  };

  const scrollToLatestMessage = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToLatestMessage();
  }, [chatMessages, isAnalyzing]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pdf ? pdf.title : '',
        text: pdf ? pdf.summary : '',
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast(language === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard');
    }
  };

  const handleRetryLoading = () => {
    setIsLoadingPdf(true);
    setPdfError(null);
    setRetryCount(prev => prev + 1);
  };

  const updateAnalysisProgress = (progress: AnalysisProgress) => {
    setAnalysisProgress(progress);
  };

  const extractPDFContent = async () => {
    if (!pdf?.dataUrl || pdfTextContent) return pdfTextContent;
    
    try {
      setAnalysisProgress({
        stage: 'extracting',
        progress: 10,
        message: language === 'ar' 
          ? 'بدء استخراج النص من ملف PDF...' 
          : 'Starting text extraction from PDF...'
      });
      
      const text = await extractTextFromPDF(pdf.dataUrl, pdf.id, updateAnalysisProgress);
      setPdfTextContent(text);
      
      setAnalysisProgress({
        stage: 'extracting',
        progress: 100,
        message: language === 'ar'
          ? 'تم استخراج النص بنجاح من الملف'
          : 'Text successfully extracted from PDF'
      });
      
      return text;
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      setAnalysisProgress({
        stage: 'error',
        progress: 0,
        message: language === 'ar'
          ? 'فشل في استخراج النص من الملف'
          : 'Failed to extract text from PDF'
      });
      return null;
    }
  };

  const saveMessage = async (messageContent: string, isUser: boolean): Promise<ChatMessage | null> => {
    if (!id || !pdf) return null;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: messageContent,
      isUser,
      timestamp: new Date()
    };

    try {
      if (isTempPdf) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (!parsedData.fileData.chatMessages) {
              parsedData.fileData.chatMessages = [];
            }
            
            parsedData.fileData.chatMessages.push(newMessage);
            sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
            return newMessage;
          } catch (error) {
            console.error('Error saving message to temporary PDF:', error);
          }
        }
      } else if (user) {
        const result = await addSupabaseChatMessage(id, messageContent, isUser);
        if (result) {
          return {
            id: result.id,
            content: result.content,
            isUser: result.isUser,
            timestamp: result.timestamp
          };
        }
      } else {
        const savedMessage = addChatMessageToPDF(id, {
          content: messageContent,
          isUser,
          timestamp: new Date()
        });
        
        if (savedMessage) {
          // Update local PDF state
          const updatedPdf = {
            ...pdf,
            chatMessages: [...(pdf.chatMessages || []), savedMessage]
          };
          setPdf(updatedPdf);
          return savedMessage;
        }
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }

    return newMessage; // Return the message even if saving fails
  };

  const handleChatSubmit = async (message: string) => {
    if (!message || !id || !pdf) return;

    console.log('Submitting chat message:', message);

    try {
      // Save user message
      const savedUserMessage = await saveMessage(message, true);
      if (savedUserMessage) {
        setChatMessages(prev => [...prev, savedUserMessage]);
      }

      setIsAnalyzing(true);
      setIsWaitingForResponse(true);
      
      setAnalysisProgress({
        stage: 'waiting',
        progress: 15,
        message: language === 'ar'
          ? 'لحظة من فضلك، نعمل على إجابة سؤالك...'
          : 'One moment please, working on your answer...'
      });
      
      scrollToLatestMessage();
      
      try {
        let textContent = pdfTextContent;
        if (!textContent) {
          textContent = await extractPDFContent();
          
          if (!textContent) {
            throw new Error(language === 'ar'
              ? 'فشل في استخراج النص من الملف'
              : 'Failed to extract text from PDF');
          }
        }
        
        setAnalysisProgress({
          stage: 'analyzing',
          progress: 50,
          message: language === 'ar'
            ? 'تحليل محتوى الملف...'
            : 'Analyzing PDF content...'
        });
        
        setAnalysisProgress({
          stage: 'generating',
          progress: 75,
          message: language === 'ar'
            ? 'إنشاء إجابة دقيقة...'
            : 'Generating accurate answer...'
        });
        
        const aiContent = await analyzePDFWithGemini(
          textContent, 
          message, 
          updateAnalysisProgress, 
          chatMessages.filter(m => !m.isUser).slice(-5)
        );
        
        const savedAiMessage = await saveMessage(aiContent, false);
        if (savedAiMessage) {
          setChatMessages(prev => [...prev, savedAiMessage]);
        }
      } catch (error) {
        console.error('Error in AI analysis:', error);
        setAnalysisProgress({
          stage: 'error',
          progress: 0,
          message: language === 'ar'
            ? 'حدث خطأ أثناء تحليل الملف'
            : 'Error during PDF analysis'
        });
          
        const fallbackResponse = language === 'ar'
          ? "عذرًا، حدث خطأ أثناء تحليل الملف. يرجى المحاولة مرة أخرى لاحقًا."
          : "Sorry, there was an error analyzing the PDF. Please try again later.";
          
        const savedFallbackMessage = await saveMessage(fallbackResponse, false);
        if (savedFallbackMessage) {
          setChatMessages(prev => [...prev, savedFallbackMessage]);
        }
      } finally {
        setIsAnalyzing(false);
        setIsWaitingForResponse(false);
      }
    } catch (error) {
      console.error('Error adding user message:', error);
      setIsAnalyzing(false);
      setIsWaitingForResponse(false);
      toast.error(language === 'ar' 
        ? 'حدث خطأ أثناء إضافة رسالتك' 
        : 'Error adding your message');
    }
  };

  const handleResetChat = () => {
    if (!id || !pdf) return;
    
    const confirmMessage = language === 'ar' 
      ? 'هل أنت متأكد أنك تريد مسح جميع الرسائل؟'
      : 'Are you sure you want to clear all messages?';
      
    if (window.confirm(confirmMessage)) {
      setChatMessages([]);
      
      if (isTempPdf) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            parsedData.fileData.chatMessages = [];
            sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
          } catch (error) {
            console.error('Error clearing chat messages from temporary PDF:', error);
          }
        }
      }
      
      toast.success(language === 'ar' 
        ? 'تم مسح المحادثة بنجاح'
        : 'Chat cleared successfully');
    }
  };

  const handleCopyMessage = (content: string) => {
    toast.success(language === 'ar' 
      ? 'تم نسخ الرسالة إلى الحافظة'
      : 'Message copied to clipboard');
  };

  const handleRegenerateMessage = (messageId: string) => {
    // Find the user message before this AI message and re-submit it
    const messageIndex = chatMessages.findIndex(m => m.id === messageId);
    if (messageIndex > 0) {
      const previousMessage = chatMessages[messageIndex - 1];
      if (previousMessage.isUser) {
        // Remove the AI message and regenerate
        setChatMessages(prev => prev.slice(0, messageIndex));
        handleChatSubmit(previousMessage.content);
      }
    }
  };

  const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    // This could be used to improve the AI responses in the future
    console.log('Message feedback:', messageId, feedback);
  };

  if (!pdf) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-xl font-medium mb-2">
          {language === 'ar' ? 'لم يتم العثور على الملف' : 'PDF Not Found'}
        </h1>
        <Link 
          to="/" 
          className="text-primary hover:underline"
        >
          {language === 'ar' ? 'العودة إلى الصفحة الرئيسية' : 'Return to Home'}
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
              to={isTempPdf ? "/" : "/pdfs"} 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' 
                ? isTempPdf ? 'العودة إلى الصفحة الرئيسية' : 'العودة إلى قائمة الملفات' 
                : isTempPdf ? 'Back to Home' : 'Back to PDFs'}
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={language === 'ar' ? 'مشاركة الملف' : 'Share file'}
              >
                <Share className="h-5 w-5" />
              </button>
              
              <Link
                to={`/translate/${id}`}
                className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label={language === 'ar' ? 'ترجمة الملف' : 'Translate PDF'}
              >
                <Languages className="h-5 w-5" />
              </Link>
              
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
                    {isTempPdf && (
                      <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-900/30">
                        {language === 'ar' ? 'مؤقت' : 'Temporary'}
                      </Badge>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setShowPdfControls(!showPdfControls)}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  {showPdfControls ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden bg-muted/10" style={{ height: 'calc(100vh - 300px)' }}>
                {isLoadingPdf ? (
                  <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin mb-4" />
                    <p className="text-lg font-medium mb-2">
                      {language === 'ar' ? 'جاري تحميل الملف...' : 'Loading PDF...'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
                    </p>
                  </div>
                ) : pdfError ? (
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
                      <Button onClick={() => navigate(isTempPdf ? '/' : '/pdfs')}>
                        {language === 'ar'
                          ? isTempPdf ? 'العودة إلى الصفحة الرئيسية' : 'العودة إلى قائمة الملفات' 
                          : isTempPdf ? 'Back to Home' : 'Back to PDF List'}
                      </Button>
                    </div>
                  </div>
                ) : !pdf.dataUrl ? (
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
                    <Button onClick={() => navigate(isTempPdf ? '/' : '/pdfs')}>
                      {language === 'ar'
                        ? isTempPdf ? 'العودة إلى الصفحة الرئيسية' : 'العودة إلى قائمة الملفات' 
                        : isTempPdf ? 'Back to Home' : 'Back to PDF List'}
                    </Button>
                  </div>
                ) : (
                  <ScrollablePDFViewer
                    pdfUrl={pdf.dataUrl}
                    onDocumentLoadSuccess={handleDocumentLoadSuccess}
                    onDocumentLoadError={handleDocumentLoadError}
                    onPageChange={handlePageChange}
                    className="h-full"
                  />
                )}
              </div>
            </div>
            
            <div className="lg:w-1/3 bg-card rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
              <div className="flex justify-between items-center p-4 border-b">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h2 className="font-display text-lg font-medium">
                    {language === 'ar' ? 'دردشة ذكية' : 'AI Chat'}
                  </h2>
                  {chatMessages.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {chatMessages.length}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleResetChat}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          aria-label={language === 'ar' ? 'إعادة تعيين المحادثة' : 'Reset chat'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {language === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowChat(!showChat)}
                    className="h-8 w-8"
                  >
                    {showChat ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
              
              {showChat && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '60vh' }}>
                    {isLoadingMessages ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="h-10 w-10 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="font-medium mb-2">
                          {language === 'ar' ? 'ابدأ محادثة ذكية مع الملف' : 'Start an intelligent conversation with your PDF'}
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          {language === 'ar' 
                            ? 'اطرح أسئلة معقدة واحصل على إجابات دقيقة باستخدام ذكاء Gemini الاصطناعي'
                            : 'Ask complex questions and get accurate answers powered by Gemini AI'
                          }
                        </p>
                        {isTempPdf && (
                          <p className="text-xs text-amber-600 mt-2 p-2 bg-amber-50 rounded-lg">
                            {language === 'ar'
                              ? 'ملاحظة: هذا ملف مؤقت. ستفقد المحادثة عند إغلاق المتصفح.'
                              : 'Note: This is a temporary file. Chat will be lost when you close the browser.'}
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        {chatMessages.map(message => (
                          <ChatMessageBubble
                            key={message.id}
                            message={message}
                            language={language}
                            onCopy={handleCopyMessage}
                            onRegenerate={handleRegenerateMessage}
                            onFeedback={handleMessageFeedback}
                          />
                        ))}

                        {isAnalyzing && (
                          <div className="mr-auto max-w-[80%]">
                            <PDFAnalysisProgress analysis={analysisProgress} />
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </div>
                  
                  <EnhancedChatInput 
                    onSubmit={handleChatSubmit}
                    placeholder={language === 'ar' 
                      ? "اطرح سؤالاً ذكياً حول محتوى الملف..."
                      : "Ask an intelligent question about the PDF content..."
                    }
                    dir={language === 'ar' ? 'rtl' : 'ltr'}
                    disabled={isWaitingForResponse}
                    suggestions={chatSuggestions}
                    isAnalyzing={isAnalyzing}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PDFViewer;
