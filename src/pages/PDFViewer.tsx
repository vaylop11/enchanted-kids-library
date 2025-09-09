import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, FileText, MessageSquare, Bot, Sparkles, Search, RotateCcw, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [chatMessages, setChatMessages] = useState<SmartChatMessage[]>([]);
  const [pdf, setPdf] = useState<UploadedPDF | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(true);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isTempPdf, setIsTempPdf] = useState(false);
  const [pdfTextContent, setPdfTextContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: 'extracting',
    progress: 0,
    message: 'Preparing to analyze PDF...'
  });

  // Enhanced quick actions for better user value
  const quickActions = [
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
        const messages = await getChatMessagesForPDF(id);
        setChatMessages(messages.map(convertToSmartMessage));
        
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
        setIsLoadingPdf(false);
      } else {
        console.log('PDF not found in localStorage with ID:', id);
        setPdfError('PDF not found. It may have been deleted or expired.');
        setIsLoadingPdf(false);
      }
    };

    loadPdf();
  }, [id, user, navigate]);

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
        language === 'ar' ? 'عذراً، حدث خطأ أثناء تحليل المستند. يرجى المحاولة مرة أخرى.' : 'Sorry, an error occurred while analyzing the document. Please try again.',
        false
      );
      if (errorMessage) {
        setChatMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsAnalyzing(false);
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

  // Handle chat reset
  const handleResetChat = () => {
    setChatMessages([]);
    setPdfTextContent(null);
    toast.success('Chat cleared');
  };

  // Handle quick action click
  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleChatSubmit(action.prompt);
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
                <h3 className="text-lg font-semibold">
                  {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'يرجى الانتظار بينما نقوم بتحضير مستندك' : 'Please wait while we prepare your document'}
                </p>
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
              <h2 className="text-2xl font-bold text-foreground">
                {language === 'ar' ? 'مشكلة في تحميل المستند' : 'Problem loading document'}
              </h2>
              <p className="text-muted-foreground max-w-md">
                {pdfError || (language === 'ar' ? 'لم يتم العثور على المستند. قد يكون قد تم حذفه أو انتهت صلاحيته.' : 'Document not found. It may have been deleted or expired.')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => navigate('/pdfs')} variant="default">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'العودة إلى المستندات' : 'Back to Documents'}
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                {language === 'ar' ? 'إعادة تحميل الصفحة' : 'Reload Page'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced Chat Interface - Main component
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      <Navbar />
      
      <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col">
        {/* Chat Header */}
        <div className={cn(
          "flex-shrink-0 bg-card/80 backdrop-blur-sm border-b border-border/50 rounded-t-lg",
          isMobile ? "p-3" : "p-4"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/pdfs')}
                className="text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="relative">
                <div className={cn(
                  "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center",
                  isMobile ? "p-1.5" : "p-2"
                )}>
                  <MessageSquare className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
                </div>
                {isAnalyzing && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </div>
              <div>
                <h1 className={cn("font-semibold", isMobile ? "text-sm" : "text-lg")}>
                  {language === 'ar' ? 'محادثة ذكية مع المستند' : 'Smart Document Chat'}
                </h1>
                <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                  {pdf?.title ? (isMobile 
                    ? `${pdf.title.substring(0, 25)}...` 
                    : `${pdf.title.substring(0, 40)}...`)
                    : (language === 'ar' ? 'جاهز للمساعدة' : 'Ready to help')
                  }
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleResetChat}
              className="text-muted-foreground hover:text-destructive"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fixed Quick Actions Bar */}
        <div className={cn(
          "flex-shrink-0 bg-muted/20 border-b border-border/50",
          isMobile ? "p-2" : "p-3"
        )}>
          <div className={cn(
            "flex gap-2 overflow-x-auto scrollbar-hide",
            isMobile ? "pb-1" : ""
          )}>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                size={isMobile ? "sm" : "sm"}
                onClick={() => handleQuickAction(action)}
                disabled={isAnalyzing}
                className={cn(
                  "flex-shrink-0 gap-2 font-medium border-dashed hover:border-solid transition-all duration-200",
                  action.color,
                  isMobile ? "h-8 px-3 text-xs" : "h-9 px-4 text-sm"
                )}
              >
                <action.icon className="h-3 w-3" />
                <span className="whitespace-nowrap">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 min-h-0 bg-card/50 backdrop-blur-sm">
          <ScrollArea className="h-full">
            <div className={cn("h-full", isMobile ? "p-3" : "p-4")}>
              <div className={cn("space-y-4 min-h-full", isMobile && "space-y-3")}>
                {chatMessages.length === 0 ? (
                  <div className={cn(
                    "flex flex-col items-center justify-center h-full text-center min-h-[400px]",
                    isMobile ? "py-8" : "py-12"
                  )}>
                    <div className="relative mb-6">
                      <div className={cn(
                        "bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center",
                        isMobile ? "p-4" : "p-6"
                      )}>
                        <Bot className={cn("text-primary", isMobile ? "h-8 w-8" : "h-12 w-12")} />
                      </div>
                      <div className="absolute -bottom-2 -right-2 p-2 bg-background rounded-full border border-border">
                        <Sparkles className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <h2 className={cn("font-bold mb-3", isMobile ? "text-lg" : "text-2xl")}>
                      {language === 'ar' ? 'ابدأ محادثة ذكية' : 'Start Smart Conversation'}
                    </h2>
                    <p className={cn(
                      "text-muted-foreground max-w-lg leading-relaxed mb-6",
                      isMobile ? "text-sm px-4" : "text-base"
                    )}>
                      {language === 'ar' 
                        ? 'استخدم الإجراءات السريعة أعلاه أو اطرح أي سؤال حول مستندك للحصول على إجابات ذكية ومفصلة'
                        : 'Use the quick actions above or ask any question about your document to get smart and detailed answers'
                      }
                    </p>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message, index) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex animate-fade-in",
                          message.isUser ? "justify-end" : "justify-start",
                          isMobile ? "gap-2" : "gap-3"
                        )}
                      >
                        {!message.isUser && (
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center",
                              isMobile ? "p-1.5" : "p-2"
                            )}>
                              <Bot className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            </div>
                          </div>
                        )}
                        
                        <div className={cn(
                          "space-y-2",
                          message.isUser ? "items-end" : "items-start",
                          isMobile ? "max-w-[85%]" : "max-w-[80%]"
                        )}>
                          <Card className={cn(
                            "transition-all duration-200 hover:shadow-md",
                            message.isUser 
                              ? "bg-primary text-primary-foreground ml-auto" 
                              : "bg-card/80 backdrop-blur-sm",
                            isMobile ? "p-3" : "p-4"
                          )}>
                            <div className={cn(
                              "whitespace-pre-wrap leading-relaxed",
                              isMobile ? "text-sm" : ""
                            )}>
                              {message.content}
                            </div>
                            
                            {!message.isUser && (
                              <div className={cn(
                                "flex items-center justify-between border-t border-border/30",
                                isMobile ? "mt-2 pt-2 flex-col gap-2" : "mt-3 pt-3 flex-row"
                              )}>
                                <div className={cn(
                                  "flex items-center gap-1",
                                  isMobile && "w-full justify-center"
                                )}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyMessage(message.content)}
                                    className={cn("text-xs", isMobile ? "h-6 px-2" : "h-7 px-3")}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    {language === 'ar' ? 'نسخ' : 'Copy'}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRegenerateMessage(message.id)}
                                    className={cn("text-xs", isMobile ? "h-6 px-2" : "h-7 px-3")}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    {language === 'ar' ? 'إعادة' : 'Retry'}
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Card>
                        </div>
                      </div>
                    ))}
                    
                    {/* Analysis indicator */}
                    {isAnalyzing && (
                      <div className={cn("flex animate-fade-in", isMobile ? "gap-2" : "gap-3")}>
                        <div className={cn(
                          "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center",
                          isMobile ? "p-1.5" : "p-2"
                        )}>
                          <Bot className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        </div>
                        <Card className={cn("backdrop-blur-sm", isMobile ? "p-3" : "p-4")}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                />
                              ))}
                            </div>
                            <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                              {language === 'ar' ? 'يحلل المحتوى...' : 'Analyzing content...'}
                            </span>
                          </div>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Chat Input */}
        <div className="flex-shrink-0 bg-card/80 backdrop-blur-sm border-t border-border/50 rounded-b-lg">
          <ChatInput
            onSubmit={handleChatSubmit}
            placeholder={language === 'ar' ? 'اكتب سؤالك حول المستند...' : 'Ask anything about your document...'}
            disabled={isAnalyzing}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            autoFocus={!isMobile}
          />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;