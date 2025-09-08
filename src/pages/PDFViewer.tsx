import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, FileText, Share, Languages, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';
import ModernPDFViewer from '@/components/pdf/ModernPDFViewer';
import SmartChatInterface, { SmartChatMessage } from '@/components/chat/SmartChatInterface';
import ResizablePDFLayout from '@/components/layout/ResizablePDFLayout';
import InteractiveTranslationPanel from '@/components/translation/InteractiveTranslationPanel';
import { translateText } from '@/services/translationService';
import { v4 as uuidv4 } from 'uuid';
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

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [chatMessages, setChatMessages] = useState<SmartChatMessage[]>([]);
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
  
  // Translation state
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('en');

  // Chat suggestions based on PDF content
  const chatSuggestions = [
    language === 'ar' ? 'ما هو الموضوع الرئيسي لهذا المستند؟' : 'What is the main topic of this document?',
    language === 'ar' ? 'لخص النقاط المهمة' : 'Summarize the key points',
    language === 'ar' ? 'ما هي الاستنتاجات الرئيسية؟' : 'What are the main conclusions?',
    language === 'ar' ? 'اشرح الأقسام المعقدة' : 'Explain the complex sections',
  ];

  // Convert old ChatMessage to SmartChatMessage
  const convertToSmartMessage = (msg: ChatMessage): SmartChatMessage => ({
    id: msg.id || uuidv4(),
    content: msg.content,
    isUser: msg.isUser,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
  });

  // Load PDF from Supabase
  const tryLoadFromSupabase = async (): Promise<boolean> => {
    if (!user || !id) return false;
    
    try {
      const supabasePdf = await getSupabasePDFById(id);
      if (supabasePdf) {
        console.log('PDF found in Supabase:', supabasePdf);
        // Convert SupabasePDF to UploadedPDF format
        const uploadedPdf: UploadedPDF = {
          ...supabasePdf,
          dataUrl: supabasePdf.fileUrl || ''
        };
        setPdf(uploadedPdf);
        setIsLoadingPdf(false);
        
        // Load chat messages
        setIsLoadingMessages(true);
        const messages = await getChatMessagesForPDF(id);
        setChatMessages(messages.map(convertToSmartMessage));
        setMessagesLoaded(true);
        setIsLoadingMessages(false);
        
        return true;
      }
    } catch (error) {
      console.error('Error loading PDF from Supabase:', error);
    }
    
    return false;
  };

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
              const messages = parsedData.fileData.chatMessages || [];
              setChatMessages(messages.map(convertToSmartMessage));
              setMessagesLoaded(true);
              setIsLoadingPdf(false);
              return;
            }
          } catch (error) {
            console.error('Error parsing temp PDF data:', error);
          }
        }
        
        setPdfError('Temporary PDF not found. It may have expired.');
        setIsLoadingPdf(false);
        return;
      }

      // Try loading from Supabase first if user is authenticated
      if (user) {
        const success = await tryLoadFromSupabase();
        if (success) return;
      }

      // Fallback to local storage
      const localPdf = getPDFById(id);
      if (localPdf) {
        console.log('PDF found in localStorage:', localPdf);
        setPdf(localPdf);
        const messages = localPdf.chatMessages || [];
        setChatMessages(messages.map(convertToSmartMessage));
        setMessagesLoaded(true);
        setIsLoadingPdf(false);
      } else {
        console.log('PDF not found in localStorage with ID:', id);
        setPdfError('PDF not found. It may have been deleted or expired.');
        setIsLoadingPdf(false);
      }
    };

    loadPdf();
  }, [id, user, navigate]);

  // Handle PDF document load success
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoaded(true);
  };

  // Handle PDF document load error
  const handleDocumentLoadError = (error: Error) => {
    console.error('PDF load error:', error);
    setPdfError('Failed to load PDF. Please try again.');
    setIsLoaded(false);
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Save message to storage
  const saveMessage = async (messageContent: string, isUser: boolean): Promise<SmartChatMessage | null> => {
    const newMessage: SmartChatMessage = {
      id: uuidv4(),
      content: messageContent,
      isUser,
      timestamp: new Date()
    };

    if (isTempPdf) {
      // For temp PDFs, save to sessionStorage
      try {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          const parsedData = JSON.parse(tempPdfData);
          if (!parsedData.fileData.chatMessages) {
            parsedData.fileData.chatMessages = [];
          }
          parsedData.fileData.chatMessages.push(newMessage);
          sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
        }
      } catch (error) {
        console.error('Error saving message to sessionStorage:', error);
      }
    } else if (user && pdf?.id) {
      // Save to Supabase for authenticated users
      try {
        await addSupabaseChatMessage(pdf.id, newMessage.content, newMessage.isUser);
      } catch (error) {
        console.error('Error saving message to Supabase:', error);
        toast.error('Failed to save message to cloud storage');
      }
    } else if (pdf?.id) {
      // Save to localStorage for unauthenticated users
      try {
        addChatMessageToPDF(pdf.id, { content: newMessage.content, isUser: newMessage.isUser, timestamp: new Date() });
      } catch (error) {
        console.error('Error saving message to localStorage:', error);
        toast.error('Failed to save message');
      }
    }

    return newMessage;
  };

  // Extract PDF content for analysis
  const extractPDFContent = async (): Promise<string> => {
    if (pdfTextContent) {
      return pdfTextContent;
    }

    if (!pdf?.dataUrl) {
      throw new Error('PDF data not available');
    }

    try {
      const extractedText = await extractTextFromPDF(pdf.dataUrl, pdf.id);
      setPdfTextContent(extractedText);
      return extractedText;
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      throw new Error('Failed to extract PDF content');
    }
  };

  // Handle chat submission
  const handleChatSubmit = async (message: string) => {
    if (!pdf) {
      toast.error('PDF not loaded');
      return;
    }

    // Add user message immediately
    const userMessage = await saveMessage(message, true);
    if (userMessage) {
      setChatMessages(prev => [...prev, userMessage]);
    }

    setIsAnalyzing(true);
    setIsWaitingForResponse(true);

    try {
      // Extract PDF content if not already done
      const pdfContent = await extractPDFContent();
      
      // Analyze with Gemini
      const response = await analyzePDFWithGemini(
        pdfContent,
        message,
        (progress) => {
          setAnalysisProgress(progress);
        }
      );

      // Add assistant response
      const assistantMessage = await saveMessage(response, false);
      if (assistantMessage) {
        setChatMessages(prev => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error during analysis:', error);
      toast.error('Failed to analyze PDF. Please try again.');
      
      // Add error message
      const errorMessage = await saveMessage(
        'عذراً، حدث خطأ أثناء تحليل المستند. يرجى المحاولة مرة أخرى.',
        false
      );
      if (errorMessage) {
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsAnalyzing(false);
      setIsWaitingForResponse(false);
    }
  };

  // Handle message regeneration
  const handleRegenerateMessage = async (messageId: string) => {
    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = chatMessages[messageIndex - 1];
    if (!userMessage.isUser) return;

    // Remove the AI message and regenerate
    setChatMessages(prev => prev.slice(0, messageIndex));
    await handleChatSubmit(userMessage.content);
  };

  // Handle message copying
  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Message copied to clipboard');
    }).catch(() => {
      toast.error('Failed to copy message');
    });
  };

  // Handle message feedback
  const handleMessageFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setChatMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    );
    toast.success('Feedback recorded');
  };

  // Handle chat reset
  const handleResetChat = () => {
    setChatMessages([]);
    setPdfTextContent(null);
    toast.success('Chat cleared');
  };

  // Handle translation request
  const handleTranslateRequest = async (language: string) => {
    if (!pdfTextContent) {
      try {
        await extractPDFContent();
      } catch (error) {
        toast.error('Failed to extract PDF content for translation');
        return;
      }
    }

    setIsTranslating(true);
    setTargetLanguage(language);

    try {
      const result = await translateText(pdfTextContent || '', language);
      setTranslatedText(result.translatedText);
      toast.success('Translation completed');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate document');
    } finally {
      setIsTranslating(false);
    }
  };

  // Handle PDF deletion
  const handleDeletePDF = async () => {
    if (!pdf?.id) return;

    try {
      if (user) {
        await deleteSupabasePDF(pdf.id);
      } else {
        deletePDFById(pdf.id);
      }
      toast.success('PDF deleted successfully');
      navigate('/pdfs');
    } catch (error) {
      console.error('Error deleting PDF:', error);
      toast.error('Failed to delete PDF');
    }
  };

  // Handle PDF sharing
  const handleShare = async () => {
    if (!pdf) return;

    const shareData = {
      title: pdf.title,
      text: `Check out this PDF: ${pdf.title}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast.success('Link copied to clipboard');
      }).catch(() => {
        toast.error('Failed to copy link');
      });
    }
  };

  // Handle PDF download
  const handleDownload = () => {
    if (!pdf?.dataUrl) return;

    const link = document.createElement('a');
    link.href = pdf.dataUrl;
    link.download = pdf.title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
  if (isLoadingPdf) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
                <FileText className="absolute inset-0 h-16 w-16 text-primary/20 mx-auto" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">جاري تحميل المستند...</h3>
                <p className="text-muted-foreground">يرجى الانتظار بينما نقوم بتحضير مستندك</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (pdfError || !pdf) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-4 bg-destructive/10 rounded-full">
              <FileText className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">مشكلة في تحميل المستند</h2>
              <p className="text-muted-foreground max-w-md">
                {pdfError || 'لم يتم العثور على المستند. قد يكون قد تم حذفه أو انتهت صلاحيته.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate('/pdfs')} variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                العودة إلى المستندات
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                إعادة تحميل الصفحة
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main PDF viewer interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      
      <ResizablePDFLayout
        pdfViewer={
          <ModernPDFViewer
            pdfUrl={pdf.dataUrl}
            onDocumentLoadSuccess={handleDocumentLoadSuccess}
            onDocumentLoadError={handleDocumentLoadError}
            onPageChange={handlePageChange}
            className="h-full"
          />
        }
        chatInterface={
          <SmartChatInterface
            messages={chatMessages}
            onSendMessage={handleChatSubmit}
            onRegenerateMessage={handleRegenerateMessage}
            onCopyMessage={handleCopyMessage}
            onMessageFeedback={handleMessageFeedback}
            onResetChat={handleResetChat}
            onTranslateRequest={handleTranslateRequest}
            isAnalyzing={isAnalyzing}
            suggestions={chatSuggestions}
            pdfTitle={pdf.title}
            className="h-full"
          />
        }
        translationPanel={
          <InteractiveTranslationPanel
            originalText={pdfTextContent || ''}
            translatedText={translatedText}
            isTranslating={isTranslating}
            targetLanguage={targetLanguage}
            onLanguageChange={setTargetLanguage}
            onRetranslate={() => handleTranslateRequest(targetLanguage)}
            onCopyOriginal={() => handleCopyMessage(pdfTextContent || '')}
            onCopyTranslated={() => handleCopyMessage(translatedText)}
            onDownload={handleDownload}
            currentPage={currentPage}
            totalPages={numPages || 1}
            className="h-full"
          />
        }
        onShare={handleShare}
        onDownload={handleDownload}
        onDelete={handleDeletePDF}
        className="flex-1"
      />

      {/* Analysis Progress Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <PDFAnalysisProgress
              analysis={analysisProgress}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;