
import { useReducer, useEffect, useRef, useCallback, useMemo, Component, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, FileText, MessageSquare, Bot, Sparkles, Search, RotateCcw, Copy, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SmartChatMessage } from '@/components/chat/SmartChatInterface';
import { ChatInput } from '@/components/ui/chat-input';
import { v4 as uuidv4 } from 'uuid';
import {
  getPDFById,
  addChatMessageToPDF,
  ChatMessage,
  UploadedPDF
} from '@/services/pdfStorage';
import {
  getPDFById as getSupabasePDFById,
  getChatMessagesForPDF,
  addChatMessageToPDF as addSupabaseChatMessage,
} from '@/services/pdfSupabaseService';
import {
  extractTextFromPDF,
  analyzePDFWithGemini,
  AnalysisProgress
} from '@/services/pdfAnalysisService';

// Custom hook for auto-scrolling chat
const useAutoScrollToBottom = (dependency: any) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((behavior: 'auto' | 'smooth' = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: 'end',
        inline: 'nearest'
      });
    }
  }, []);

  // Auto scroll when dependency changes (new messages)
  useEffect(() => {
    if (dependency) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [dependency, scrollToBottom]);

  return { messagesEndRef, scrollContainerRef, scrollToBottom };
};

// Custom Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  FallbackComponent?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>;
  onReset?: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.FallbackComponent) {
        return (
          <this.props.FallbackComponent
            error={this.state.error}
            resetErrorBoundary={this.resetErrorBoundary}
          />
        );
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <Card className="max-w-md p-6 text-center space-y-4">
            <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error.message}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={this.resetErrorBoundary} size="sm">
                Try Again
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// State Management with useReducer
interface PDFViewerState {
pdf: UploadedPDF | null;
chatMessages: SmartChatMessage[];
isLoadingPdf: boolean;
pdfError: string | null;
isTempPdf: boolean;
pdfTextContent: string | null;
isAnalyzing: boolean;
analysisProgress: AnalysisProgress;
retryCount: number;
chatId?: string; // ✅ جديد
}

enum PDFViewerActionType {
SET_PDF = 'SET_PDF',
SET_CHAT_MESSAGES = 'SET_CHAT_MESSAGES',
SET_LOADING = 'SET_LOADING',
SET_ERROR = 'SET_ERROR',
SET_TEMP_PDF = 'SET_TEMP_PDF',
SET_PDF_TEXT = 'SET_PDF_TEXT',
SET_ANALYZING = 'SET_ANALYZING',
SET_ANALYSIS_PROGRESS = 'SET_ANALYSIS_PROGRESS',
SET_RETRY_COUNT = 'SET_RETRY_COUNT',
SET_CHAT_ID = 'SET_CHAT_ID' // ✅ جديد
}

interface PDFViewerAction {
  type: PDFViewerActionType;
  payload?: any;
}

const initialState: PDFViewerState = {
pdf: null,
chatMessages: [],
isLoadingPdf: true,
pdfError: null,
isTempPdf: false,
pdfTextContent: null,
isAnalyzing: false,
analysisProgress: {
stage: 'extracting',
progress: 0,
message: 'Preparing to analyze PDF...'
},
retryCount: 0,
chatId: undefined // ✅ جديد
};

const pdfViewerReducer = (state: PDFViewerState, action: any): PDFViewerState => {
switch (action.type) {
case PDFViewerActionType.SET_PDF:
return { ...state, pdf: action.payload };
case PDFViewerActionType.SET_CHAT_MESSAGES:
return { ...state, chatMessages: action.payload };
case PDFViewerActionType.SET_LOADING:
return { ...state, isLoadingPdf: action.payload };
case PDFViewerActionType.SET_ERROR:
return { ...state, pdfError: action.payload };
case PDFViewerActionType.SET_TEMP_PDF:
return { ...state, isTempPdf: action.payload };
case PDFViewerActionType.SET_PDF_TEXT:
return { ...state, pdfTextContent: action.payload };
case PDFViewerActionType.SET_ANALYZING:
return { ...state, isAnalyzing: action.payload };
case PDFViewerActionType.SET_ANALYSIS_PROGRESS:
return { ...state, analysisProgress: action.payload };
case PDFViewerActionType.SET_RETRY_COUNT:
return { ...state, retryCount: action.payload };
case PDFViewerActionType.SET_CHAT_ID:
return { ...state, chatId: action.payload }; // ✅ جديد
default:
return state;
}
};

    case PDFViewerActionType.SET_ERROR:
      return { 
        ...state, 
        pdfError: action.payload, 
        isLoadingPdf: false 
      };

    case PDFViewerActionType.SET_CHAT_MESSAGES:
      return { ...state, chatMessages: action.payload };

    case PDFViewerActionType.ADD_CHAT_MESSAGE:
      return { 
        ...state, 
        chatMessages: [...state.chatMessages, action.payload] 
      };

    case PDFViewerActionType.SET_ANALYZING:
      return { ...state, isAnalyzing: action.payload };

    case PDFViewerActionType.SET_ANALYSIS_PROGRESS:
      return { ...state, analysisProgress: action.payload };

    case PDFViewerActionType.SET_PDF_CONTENT:
      return { ...state, pdfTextContent: action.payload };

    case PDFViewerActionType.RESET_CHAT:
      return { 
        ...state, 
        chatMessages: [], 
        pdfTextContent: null 
      };

    case PDFViewerActionType.SET_TEMP_PDF:
      return { ...state, isTempPdf: action.payload };

    case PDFViewerActionType.INCREMENT_RETRY:
      return { ...state, retryCount: state.retryCount + 1 };

    case PDFViewerActionType.RESET_STATE:
      return initialState;

    default:
      return state;
  }
};

// Error Fallback Component
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
      <Card className="max-w-md p-6 text-center space-y-4">
        <div className="p-4 bg-destructive/10 rounded-full w-fit mx-auto">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">
          {language === 'ar' ? 'حدث خطأ غير متوقع' : 'Something went wrong'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {language === 'ar' ? 'نعتذر، حدث خطأ أثناء تحميل التطبيق' : 'Sorry, an error occurred while loading the application'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary} size="sm">
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            {language === 'ar' ? 'إعادة تحميل الصفحة' : 'Reload Page'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

// Enhanced Loading Component with Skeleton
const LoadingComponent = ({ language }: { language: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
    <Navbar />
    {/* IMPROVED: Better spacing from Navbar */}
    <div className="container mx-auto px-4 pt-6 pb-8">
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
            <FileText className="absolute inset-0 h-16 w-16 text-primary/20 mx-auto animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold animate-pulse">
              {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'ar' ? 'يرجى الانتظار بينما نقوم بتحضير مستندك' : 'Please wait while we prepare your document'}
            </p>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div className="bg-primary h-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, dispatch] = useReducer(pdfViewerReducer, initialState);

  // IMPROVED: Determine text direction based on language
  const isRTL = language === 'ar';
  const textDirection = isRTL ? 'rtl' : 'ltr';

  // Auto-scroll hook - will trigger when messages change
  const { messagesEndRef, scrollContainerRef, scrollToBottom } = useAutoScrollToBottom(state.chatMessages.length);

  // Memoized quick actions for better performance
  const quickActions = useMemo(() => [
    {
      id: 'summarize',
      icon: FileText,
      label: language === 'ar' ? 'لخص المستند' : 'Summarize Document',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20',
      prompt: language === 'ar' ? 'قم بتلخيص النقاط الرئيسية في هذا المستند' : 'Please summarize the key points in this document'
    },
    {
      id: 'analyze',
      icon: Search,
      label: language === 'ar' ? 'حلل المحتوى' : 'Analyze Content',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20',
      prompt: language === 'ar' ? 'حلل محتوى هذا المستند واشرح النقاط المهمة' : 'Analyze this document content and explain the important points'
    },
    {
      id: 'explain',
      icon: Sparkles,
      label: language === 'ar' ? 'اشرح بالتفصيل' : 'Explain in Detail',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20',
      prompt: language === 'ar' ? 'اشرح المفاهيم المعقدة في هذا المستند بطريقة مبسطة' : 'Explain the complex concepts in this document in simple terms'
    },
    {
      id: 'insights',
      icon: Bot,
      label: language === 'ar' ? 'أفكار ذكية' : 'Smart Insights',
      color: 'bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20',
      prompt: language === 'ar' ? 'ما هي الأفكار والاستنتاجات الذكية من هذا المستند؟' : 'What are the smart insights and conclusions from this document?'
    }
  ], [language]);

  // Enhanced convert function with error handling
  const convertToSmartMessage = useCallback((msg: ChatMessage): SmartChatMessage => ({
    id: msg.id || uuidv4(),
    content: msg.content,
    isUser: msg.isUser,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp),
  }), []);

  // Enhanced Supabase loading with retry mechanism
  const tryLoadFromSupabase = useCallback(async (signal: AbortSignal): Promise<boolean> => {
    if (!user || !id) return false;

    try {
      const supabasePdf = await getSupabasePDFById(id);
      if (signal.aborted) return false;

      if (supabasePdf) {
        const uploadedPdf: UploadedPDF = {
          ...supabasePdf,
          dataUrl: supabasePdf.fileUrl || ''
        };

        dispatch({ type: PDFViewerActionType.SET_PDF, payload: uploadedPdf });

        // Load chat messages
        const messages = await getChatMessagesForPDF(id);
        if (signal.aborted) return false;

        dispatch({ 
          type: PDFViewerActionType.SET_CHAT_MESSAGES, 
          payload: messages.map(convertToSmartMessage) 
        });

        return true;
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error('Error loading PDF from Supabase:', error);
        toast.error(language === 'ar' ? 'خطأ في تحميل المستند من السحابة' : 'Error loading document from cloud');
      }
    }

    return false;
  }, [user, id, convertToSmartMessage, language]);

  // Enhanced PDF loading with proper cleanup
  const loadPdf = useCallback(async (signal: AbortSignal) => {
    if (!id) {
      navigate('/');
      return;
    }

    dispatch({ type: PDFViewerActionType.SET_LOADING, payload: true });

    try {
      // Handle temp PDFs
      if (id.startsWith('temp-') || window.location.pathname.includes('/pdf/temp/')) {
        dispatch({ type: PDFViewerActionType.SET_TEMP_PDF, payload: true });

        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData && !signal.aborted) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (parsedData.fileData && parsedData.fileData.id === id) {
              dispatch({ type: PDFViewerActionType.SET_PDF, payload: parsedData.fileData });
              const messages = parsedData.fileData.chatMessages || [];
              dispatch({ 
                type: PDFViewerActionType.SET_CHAT_MESSAGES, 
                payload: messages.map(convertToSmartMessage) 
              });
              return;
            }
          } catch (error) {
            console.error('Error parsing temp PDF data:', error);
          }
        }

        if (!signal.aborted) {
          dispatch({ 
            type: PDFViewerActionType.SET_ERROR, 
            payload: language === 'ar' ? 'المستند المؤقت غير موجود. قد تكون صلاحيته منتهية.' : 'Temporary PDF not found. It may have expired.' 
          });
        }
        return;
      }

      // Try Supabase first if user is authenticated
      if (user) {
        const success = await tryLoadFromSupabase(signal);
        if (success || signal.aborted) return;
      }

      // Fallback to localStorage
      const localPdf = getPDFById(id);
      if (localPdf && !signal.aborted) {
        dispatch({ type: PDFViewerActionType.SET_PDF, payload: localPdf });
        const messages = localPdf.chatMessages || [];
        dispatch({ 
          type: PDFViewerActionType.SET_CHAT_MESSAGES, 
          payload: messages.map(convertToSmartMessage) 
        });
      } else if (!signal.aborted) {
        dispatch({ 
          type: PDFViewerActionType.SET_ERROR, 
          payload: language === 'ar' ? 'المستند غير موجود. قد يكون قد تم حذفه أو انتهت صلاحيته.' : 'PDF not found. It may have been deleted or expired.' 
        });
      }
    } catch (error) {
      if (!signal.aborted) {
        console.error('Error loading PDF:', error);
        dispatch({ 
          type: PDFViewerActionType.SET_ERROR, 
          payload: language === 'ar' ? 'خطأ في تحميل المستند' : 'Error loading document' 
        });
      }
    }
  }, [id, user, navigate, tryLoadFromSupabase, convertToSmartMessage, language]);

  // Effect with proper cleanup
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    loadPdf(signal);

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadPdf]);

  // Enhanced save message with better error handling
  const saveMessage = useCallback(async (messageContent: string, isUser: boolean): Promise<SmartChatMessage | null> => {
    const newMessage: SmartChatMessage = {
      id: uuidv4(),
      content: messageContent,
      isUser,
      timestamp: new Date()
    };

    try {
      if (state.isTempPdf) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          const parsedData = JSON.parse(tempPdfData);
          if (!parsedData.fileData.chatMessages) {
            parsedData.fileData.chatMessages = [];
          }
          parsedData.fileData.chatMessages.push(newMessage);
          sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
        }
      } else if (user && state.pdf?.id) {
        await addSupabaseChatMessage(state.pdf.id, newMessage.content, newMessage.isUser);
      } else if (state.pdf?.id) {
        addChatMessageToPDF(state.pdf.id, { 
          content: newMessage.content, 
          isUser: newMessage.isUser, 
          timestamp: new Date() 
        });
      }
    } catch (error) {
      console.error('Error saving message:', error);
      toast.error(language === 'ar' ? 'فشل في حفظ الرسالة' : 'Failed to save message');
      return null;
    }

    return newMessage;
  }, [state.isTempPdf, state.pdf?.id, user, language]);

  // Enhanced PDF content extraction with caching
  const extractPDFContent = useCallback(async (): Promise<string> => {
    if (state.pdfTextContent) {
      return state.pdfTextContent;
    }

    if (!state.pdf?.dataUrl) {
      throw new Error('PDF data not available');
    }

    try {
      const extractedText = await extractTextFromPDF(state.pdf.dataUrl, state.pdf.id);
      dispatch({ type: PDFViewerActionType.SET_PDF_CONTENT, payload: extractedText });
      return extractedText;
    } catch (error) {
      console.error('Error extracting PDF content:', error);
      throw new Error(language === 'ar' ? 'فشل في استخراج محتوى المستند' : 'Failed to extract PDF content');
    }
  }, [state.pdfTextContent, state.pdf, language]);

  // Enhanced chat submission with better error handling and auto-scroll
  const handleChatSubmit = useCallback(async (message: string) => {
    if (!state.pdf) {
      toast.error(language === 'ar' ? 'المستند غير محمل' : 'PDF not loaded');
      return;
    }

    // Add user message
    const userMessage = await saveMessage(message, true);
    if (userMessage) {
      dispatch({ type: PDFViewerActionType.ADD_CHAT_MESSAGE, payload: userMessage });
    }

    dispatch({ type: PDFViewerActionType.SET_ANALYZING, payload: true });

    try {
      const pdfContent = await extractPDFContent();

      const response = await analyzePDFWithGemini(
        pdfContent,
        message,
        (progress) => {
          dispatch({ type: PDFViewerActionType.SET_ANALYSIS_PROGRESS, payload: progress });
        }
      );

      const assistantMessage = await saveMessage(response, false);
      if (assistantMessage) {
        dispatch({ type: PDFViewerActionType.ADD_CHAT_MESSAGE, payload: assistantMessage });
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      toast.error(language === 'ar' ? 'فشل في تحليل المستند. يرجى المحاولة مرة أخرى.' : 'Failed to analyze PDF. Please try again.');

      const errorMessage = await saveMessage(
        language === 'ar' ? 'عذراً، حدث خطأ أثناء تحليل المستند. يرجى المحاولة مرة أخرى.' : 'Sorry, an error occurred while analyzing the document. Please try again.',
        false
      );
      if (errorMessage) {
        dispatch({ type: PDFViewerActionType.ADD_CHAT_MESSAGE, payload: errorMessage });
      }
    } finally {
      dispatch({ type: PDFViewerActionType.SET_ANALYZING, payload: false });
    }
  }, [state.pdf, saveMessage, extractPDFContent, language]);

  // Enhanced message regeneration
  const handleRegenerateMessage = useCallback(async (messageId: string) => {
    const messageIndex = state.chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = state.chatMessages[messageIndex - 1];
    if (!userMessage.isUser) return;

    // Remove the AI message and all subsequent messages
    const newMessages = state.chatMessages.slice(0, messageIndex);
    dispatch({ type: PDFViewerActionType.SET_CHAT_MESSAGES, payload: newMessages });

    await handleChatSubmit(userMessage.content);
  }, [state.chatMessages, handleChatSubmit]);

  // Enhanced message copying with feedback
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success(language === 'ar' ? 'تم نسخ الرسالة' : 'Message copied to clipboard');
    }).catch(() => {
      toast.error(language === 'ar' ? 'فشل في نسخ الرسالة' : 'Failed to copy message');
    });
  }, [language]);

  // Enhanced chat reset
const handleResetChat = (state: PDFViewerState, dispatch: any, language: string) => {
if (!state.chatId) {
toast.error(language === "ar" ? "لا توجد محادثة محددة" : "No chat selected");
return;
}

    // 🗑️ حذف كل الرسائل المرتبطة بالـ chat_id
    const { error } = await supabase
      .from("chat_messages")
      .delete()
      .eq("chat_id", state.chatId);

    if (error) throw error;

    // 🧹 مسحها محليًا
    dispatch({ type: PDFViewerActionType.SET_CHAT_MESSAGES, payload: [] });
toast.success(language === "ar" ? "تمت إعادة ضبط المحادثة" : "Chat has been reset");
};

    toast.success(language === "ar" ? "تم مسح المحادثة نهائيًا" : "Chat permanently deleted");
  } catch (err) {
    console.error("Error deleting chat:", err);
    toast.error(language === "ar" ? "فشل في المسح" : "Failed to delete chat");
  }
}, [state.chatId, language]);



  // Enhanced quick action handler
  const handleQuickAction = useCallback((action: typeof quickActions[0]) => {
    handleChatSubmit(action.prompt);
  }, [handleChatSubmit]);

  // Retry mechanism
  const handleRetry = useCallback(() => {
    dispatch({ type: PDFViewerActionType.INCREMENT_RETRY });

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    loadPdf(abortControllerRef.current.signal);
  }, [loadPdf]);

  // Loading state with enhanced UI
  if (state.isLoadingPdf) {
    return <LoadingComponent language={language} />;
  }

  // Enhanced error state with retry option
  if (state.pdfError || !state.pdf) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Navbar />
        {/* IMPROVED: Better spacing from Navbar */}
        <div className="container mx-auto px-4 pt-6 pb-4 h-[calc(100vh-80px)] flex flex-col gap-4">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="p-4 bg-destructive/10 rounded-full">
              <FileText className="h-12 w-12 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                {language === 'ar' ? 'مشكلة في تحميل المستند' : 'Problem loading document'}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {state.pdfError || (language === 'ar' ? 'لم يتم العثور على المستند. قد يكون قد تم حذفه أو انتهت صلاحيته.' : 'Document not found. It may have been deleted or expired.')}
              </p>
              {state.retryCount > 0 && (
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? `محاولة ${state.retryCount}` : `Attempt ${state.retryCount}`}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetry} variant="default" disabled={state.retryCount >= 3}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
              <Button onClick={() => navigate('/pdfs')} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'العودة إلى المستندات' : 'Back to Documents'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render with enhanced UI and auto-scroll
  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback} 
      onReset={() => dispatch({ type: PDFViewerActionType.RESET_STATE })}
    >
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
        <Navbar />

        {/* IMPROVED: Better container spacing and responsive layout */}
        <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col pt-4 pb-4 px-4 gap-6">
          {/* Enhanced Chat Header */}
          <div className={cn(
            "flex-shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50 rounded-t-lg shadow-sm",
            isMobile ? "p-3" : "p-4"
          )}>
            <div className="flex items-center justify-between mt-10">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/pdfs')}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <div className={cn(
                    "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center transition-all duration-200",
                    isMobile ? "p-1.5" : "p-2"
                  )}>
                    <MessageSquare className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                  </div>
                  {state.isAnalyzing && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse">
                      <div className="h-full w-full bg-green-400 rounded-full animate-ping" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className={cn("font-semibold truncate", isMobile ? "text-sm" : "text-lg")}>
                    {language === 'ar' ? 'محادثة ذكية مع المستند' : 'Smart Document Chat'}
                  </h1>
                  <p className={cn("text-muted-foreground truncate", isMobile ? "text-xs" : "text-sm")}>
                    {state.pdf?.title ? (isMobile 
                      ? `${state.pdf.title.substring(0, 25)}...` 
                      : `${state.pdf.title.substring(0, 40)}...`)
                      : (language === 'ar' ? 'جاهز للمساعدة' : 'Ready to help')
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {state.chatMessages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleResetChat}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                    title={language === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions Bar */}
          <div className={cn(
            "flex-shrink-0 bg-muted/20 border-b border-border/50 transition-all duration-200",
            isMobile ? "p-2" : "p-3"
          )}>
            <div className={cn(
              "flex gap-2 overflow-x-auto scrollbar-hide",
              isMobile ? "pb-1" : "",
              // IMPROVED: RTL support for action buttons
              isRTL ? "flex-row-reverse" : "flex-row"
            )}>
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={() => handleQuickAction(action)}
                  disabled={state.isAnalyzing}
                  className={cn(
                    "flex-shrink-0 gap-2 font-medium border-dashed hover:border-solid transition-all duration-200 hover:shadow-sm",
                    action.color,
                    isMobile ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm",
                    state.isAnalyzing && "opacity-50 cursor-not-allowed"
                  )}
                  dir={textDirection}
                >
                  <action.icon className="h-3 w-3" />
                  <span className="whitespace-nowrap">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Chat Messages Area with Auto-Scroll and RTL Support */}
          <div className="flex-1 min-h-0 bg-card/50 backdrop-blur-sm">
            <ScrollArea className="h-full" ref={scrollContainerRef}>
              <div className={cn("h-full", isMobile ? "p-3" : "p-4")}>
                <div className={cn("space-y-4 min-h-full", isMobile && "space-y-3")}>
                  {state.chatMessages.length === 0 ? (
                    <div className={cn(
                      "flex flex-col items-center justify-center h-full text-center min-h-[400px]",
                      isMobile ? "py-8" : "py-12"
                    )}>
                      <div className="relative mb-6">
                        <div className={cn(
                          "bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center shadow-lg",
                          isMobile ? "p-4" : "p-6"
                        )}>
                          <Bot className={cn("text-primary", isMobile ? "h-8 w-8" : "h-12 w-12")} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 p-2 bg-background rounded-full border border-border shadow-sm">
                          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                        </div>
                      </div>
                      <h2 className={cn("font-bold mb-3", isMobile ? "text-lg" : "text-2xl")}>
                        {language === 'ar' ? 'ابدأ محادثة ذكية' : 'Start Smart Conversation'}
                      </h2>
                      <p className={cn(
                        "text-muted-foreground max-w-lg leading-relaxed mb-6",
                        isMobile ? "text-sm px-4" : "text-base"
                      )}
                      dir={textDirection}
                      >
                        {language === 'ar' 
                          ? 'استخدم الإجراءات السريعة أعلاه أو اطرح أي سؤال حول مستندك للحصول على إجابات ذكية ومفصلة'
                          : 'Use the quick actions above or ask any question about your document to get smart and detailed answers'
                        }
                      </p>
                    </div>
                  ) : (
                    <>
                      {state.chatMessages.map((message, index) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex animate-fade-in transition-all duration-300",
                            // IMPROVED: RTL support for message alignment
                            message.isUser 
                              ? (isRTL ? "justify-start" : "justify-end")
                              : (isRTL ? "justify-end" : "justify-start"),
                            isMobile ? "gap-2" : "gap-3"
                          )}
                        >
                          {/* IMPROVED: Bot avatar positioning for RTL */}
                          {!message.isUser && !isRTL && (
                            <div className="flex-shrink-0">
                              <div className={cn(
                                "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shadow-sm",
                                isMobile ? "p-1.5" : "p-2"
                              )}>
                                <Bot className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                              </div>
                            </div>
                          )}

                          <div className={cn(
                            "space-y-2",
                            message.isUser 
                              ? (isRTL ? "items-start" : "items-end")
                              : (isRTL ? "items-end" : "items-start"),
                            isMobile ? "max-w-[85%]" : "max-w-[80%]"
                          )}>
                            <Card className={cn(
                              "transition-all duration-200 hover:shadow-md",
                              message.isUser 
                                ? "bg-primary text-primary-foreground shadow-lg" 
                                : "bg-card/80 backdrop-blur-sm border border-border/50",
                              isMobile ? "p-3" : "p-4",
                              // IMPROVED: RTL margin handling
                              message.isUser && (isRTL ? "mr-auto" : "ml-auto")
                            )}>
                              {/* IMPROVED: RTL text direction for message content */}
                              <div className={cn(
                                "whitespace-pre-wrap leading-relaxed",
                                isMobile ? "text-sm" : ""
                              )}
                              dir={textDirection}
                              style={{ textAlign: isRTL ? 'right' : 'left' }}
                              >
                                {message.content}
                              </div>

                              {!message.isUser && (
                                <div className={cn(
                                  "flex items-center border-t border-border/30",
                                  isMobile ? "mt-2 pt-2 flex-col gap-2" : "mt-3 pt-3",
                                  // IMPROVED: RTL layout for action buttons
                                  !isMobile && (isRTL ? "justify-start flex-row-reverse" : "justify-between flex-row")
                                )}>
                                  <div className={cn(
                                    "flex items-center gap-1",
                                    isMobile && "w-full justify-center"
                                  )}>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopyMessage(message.content)}
                                      className={cn("text-xs hover:bg-muted/50 transition-colors", isMobile ? "h-6 px-2" : "h-7 px-3")}
                                    >
                                      <Copy className="h-3 w-3 mr-1" />
                                      {language === 'ar' ? 'نسخ' : 'Copy'}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRegenerateMessage(message.id)}
                                      className={cn("text-xs hover:bg-muted/50 transition-colors", isMobile ? "h-6 px-2" : "h-7 px-3")}
                                      disabled={state.isAnalyzing}
                                    >
                                      <RefreshCw className="h-3 w-3 mr-1" />
                                      {language === 'ar' ? 'إعادة' : 'Retry'}
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Card>
                          </div>

                          {/* IMPROVED: Bot avatar positioning for RTL */}
                          {!message.isUser && isRTL && (
                            <div className="flex-shrink-0">
                              <div className={cn(
                                "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shadow-sm",
                                isMobile ? "p-1.5" : "p-2"
                              )}>
                                <Bot className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Enhanced analysis indicator with RTL support */}
                      {state.isAnalyzing && (
                        <div className={cn(
                          "flex animate-fade-in",
                          isMobile ? "gap-2" : "gap-3",
                          isRTL ? "justify-end" : "justify-start"
                        )}>
                          {!isRTL && (
                            <div className={cn(
                              "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shadow-sm",
                              isMobile ? "p-1.5" : "p-2"
                            )}>
                              <Loader2 className={cn("text-primary animate-spin", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            </div>
                          )}
                          <Card className={cn("backdrop-blur-sm border border-border/50", isMobile ? "p-3" : "p-4")}>
                            <div className="flex items-center gap-3">
                              <div className="flex gap-1">
                                {[...Array(3)].map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.2}s` }}
                                  />
                                ))}
                              </div>
                              <div className="flex-1">
                                <span className={cn(
                                  "text-muted-foreground block",
                                  isMobile ? "text-xs" : "text-sm"
                                )}
                                dir={textDirection}
                                >
                                  {state.analysisProgress.message || (language === 'ar' ? 'يحلل المحتوى...' : 'Analyzing content...')}
                                </span>
                                <div className="w-full bg-muted rounded-full h-1 mt-1">
                                  <div 
                                    className="bg-primary h-full rounded-full transition-all duration-300" 
                                    style={{ width: `${state.analysisProgress.progress}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                          {isRTL && (
                            <div className={cn(
                              "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center shadow-sm",
                              isMobile ? "p-1.5" : "p-2"
                            )}>
                              <Loader2 className={cn("text-primary animate-spin", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
                {/* Scroll anchor - invisible element at the bottom for auto-scroll */}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </ScrollArea>
          </div>

          {/* Enhanced Chat Input with RTL Support */}
          <div className="flex-shrink-0 bg-card/80 backdrop-blur-sm border-t border-border/50 rounded-b-lg shadow-lg">
            <ChatInput
              onSubmit={handleChatSubmit}
              placeholder={language === 'ar' ? 'اكتب سؤالك حول المستند...' : 'Ask anything about your document...'}
              disabled={state.isAnalyzing}
              dir={textDirection}
              autoFocus={!isMobile}
              className={cn(
                // IMPROVED: RTL styling for input
                isRTL && "text-right"
              )}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PDFViewer;
