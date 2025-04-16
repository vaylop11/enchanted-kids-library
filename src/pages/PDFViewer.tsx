
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, supabaseUntyped } from '@/integrations/supabase/client';
import { User, ArrowLeft, Crown, Trash2, Eraser, FileText, Share, DownloadCloud, ChevronUp, ChevronDown, AlertTriangle, Copy, MoreHorizontal, RefreshCw, RotateCcw, RotateCw, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChatMessageSkeleton } from '@/components/ui/skeleton';
import { ChatInput } from '@/components/ui/chat-input';
import { MarkdownMessage } from '@/components/ui/markdown-message';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Document, Page, pdfjs } from 'react-pdf';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  AnalysisProgress,
  AnalysisStage
} from '@/services/pdfAnalysisService';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

type Message = {
  id: string;
  content: string;
  user_id: string;
  user_email: string;
  created_at: string;
};

type OnlineUser = {
  id: string;
  email: string;
  online_at: string;
};

const PDFViewer: React.FC = () => {
  // State variables
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<UploadedPDF | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: 'waiting',
    progress: 0,
    message: 'Waiting to start analysis...'
  });
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [showChat, setShowChat] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [showOnlineUsers, setShowOnlineUsers] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { language, dir } = useLanguage();

  // Load PDF and chat history
  useEffect(() => {
    if (!id) return;

    const loadPDF = async () => {
      setIsLoading(true);
      try {
        console.log('Trying to load PDF from Supabase with ID:', id);
        // Try to load from Supabase first
        const supabasePDF = await getSupabasePDFById(id);
        
        if (supabasePDF) {
          console.log('Successfully loaded PDF from Supabase:', supabasePDF);
          setPdf(supabasePDF);
          
          // Load chat messages
          const messages = await getChatMessagesForPDF(id);
          setChatMessages(messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            isUser: msg.isUser,
            timestamp: msg.timestamp
          })));
        } else {
          console.log('PDF not found in Supabase, loading from local storage');
          // Fall back to local storage
          const localPDF = await getPDFById(id);
          if (localPDF) {
            setPdf(localPDF);
            setChatMessages(localPDF.chatMessages || []);
          } else {
            toast.error('PDF not found');
            navigate('/pdfs');
          }
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast.error('Failed to load PDF');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [id, navigate]);

  // Set up real-time presence
  useEffect(() => {
    if (!id || !user) return;

    const channel = supabase.channel(`pdf:${id}`);

    // Subscribe to presence updates
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as OnlineUser[];
        setOnlineUsers(users.filter(u => u.id !== user.id));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id,
            email: user.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [id, user]);

  // Set up real-time chat updates
  useEffect(() => {
    if (!id) return;

    const chatSubscription = supabase
      .channel(`pdf_chat:${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pdf_chats',
        filter: `pdf_id=eq.${id}`
      }, (payload) => {
        const newMessage = {
          id: payload.new.id,
          content: payload.new.content,
          isUser: payload.new.is_user,
          timestamp: new Date(payload.new.timestamp)
        };
        
        // Don't add duplicates
        setChatMessages(current => {
          if (!current.some(msg => msg.id === newMessage.id)) {
            return [...current, newMessage];
          }
          return current;
        });
      })
      .subscribe();

    return () => {
      chatSubscription.unsubscribe();
    };
  }, [id]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle chat submission
  const handleChatSubmit = async (message: string) => {
    if (!id || !pdf) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    setIsAnalyzing(true);
    setAnalysisProgress({
      stage: 'waiting',
      progress: 0,
      message: language === 'ar' ? 'جار معالجة الاستعلام...' : 'Processing your query...'
    });

    try {
      // Add user message to database
      if (pdf.id.startsWith('temp-')) {
        // Local storage only for temporary PDFs
        await addChatMessageToPDF(pdf.id, userMessage);
      } else {
        // Add to Supabase for saved PDFs
        await addSupabaseChatMessage(pdf.id, message, true);
      }
      
      // Skip extraction if we've already done it
      const skipExtraction = pdfText !== null;
      
      if (!skipExtraction) {
        setAnalysisProgress({
          stage: 'analyzing',
          progress: 30,
          message: language === 'ar' ? 'تحليل محتوى PDF...' : 'Analyzing PDF content...'
        });
      } else {
        setAnalysisProgress({
          stage: 'analyzing',
          progress: 60,
          message: language === 'ar' ? 'إرسال الاستعلام إلى AI...' : 'Sending query to AI model...'
        });
      }

      // Process with Gemini, using cached text when available
      const response = await analyzePDFWithGemini(
        pdfText, 
        message,
        setAnalysisProgress,
        chatMessages.filter(msg => !msg.isUser).map(msg => msg),
        language,
        skipExtraction
      );
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: response,
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Save AI response to database
      if (pdf.id.startsWith('temp-')) {
        // Local storage for temporary PDFs
        await addChatMessageToPDF(pdf.id, aiMessage);
      } else {
        // Add to Supabase for saved PDFs
        await addSupabaseChatMessage(pdf.id, response, false);
      }
      
      // Cache the extracted text for future queries
      if (!skipExtraction && !pdfText) {
        const fileUrl = pdf.fileUrl || URL.createObjectURL(pdf.file as Blob);
        const extractedText = await extractTextFromPDF(fileUrl, pdf.id);
        setPdfText(extractedText);
      }
    } catch (error) {
      console.error('Error in AI analysis:', error);
      setAnalysisProgress({
        stage: 'error',
        progress: 100,
        message: language === 'ar' ? 'حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.' : 'Error during analysis. Please try again.'
      });
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: language === 'ar' 
          ? 'عذراً، حدث خطأ أثناء تحليل PDF. يرجى المحاولة مرة أخرى لاحقاً.'
          : 'Sorry, there was an error analyzing the PDF. Please try again later.',
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      toast.error(language === 'ar' ? 'فشل تحليل PDF' : 'Failed to analyze PDF');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle document loading success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    if (pdf && pdf.pageCount === 0 && !pdf.id.startsWith('temp-')) {
      // Update page count in database
      updatePDFMetadata(pdf.id, { pageCount: numPages });
    }
  };

  // Change page in PDF
  const changePage = (offset: number) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      return newPage >= 1 && newPage <= (numPages || 1) ? newPage : prevPageNumber;
    });
  };

  // Delete PDF
  const handleDeletePDF = async () => {
    if (!pdf) return;
    
    const confirmed = window.confirm(
      language === 'ar'
        ? 'هل أنت متأكد من أنك تريد حذف هذا PDF؟'
        : 'Are you sure you want to delete this PDF?'
    );
    
    if (confirmed) {
      try {
        if (pdf.id.startsWith('temp-')) {
          await deletePDFById(pdf.id);
        } else {
          await deleteSupabasePDF(pdf.id);
        }
        toast.success(language === 'ar' ? 'تم حذف PDF بنجاح' : 'PDF deleted successfully');
        navigate('/pdfs');
      } catch (error) {
        console.error('Error deleting PDF:', error);
        toast.error(language === 'ar' ? 'فشل حذف PDF' : 'Failed to delete PDF');
      }
    }
  };

  // Copy PDF link to clipboard
  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast.success(language === 'ar' ? 'تم نسخ الرابط إلى الحافظة' : 'Link copied to clipboard');
    });
  };

  // Download PDF
  const handleDownload = () => {
    if (!pdf) return;
    
    const link = document.createElement('a');
    if (pdf.fileUrl) {
      link.href = pdf.fileUrl;
    } else if (pdf.file) {
      link.href = URL.createObjectURL(pdf.file);
    } else {
      toast.error(language === 'ar' ? 'لا يمكن تنزيل PDF' : 'Cannot download PDF');
      return;
    }
    
    link.download = pdf.title || 'document.pdf';
    link.click();
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <Link 
                to="/pdfs" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'العودة إلى ملفات PDF' : 'Back to PDFs'}
              </Link>
            </div>
            <div className="flex justify-center items-center h-[60vh]">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render 404 state
  if (!pdf) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 p-4 md:p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <Link 
                to="/pdfs" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'ar' ? 'العودة إلى ملفات PDF' : 'Back to PDFs'}
              </Link>
            </div>
            <div className="flex flex-col justify-center items-center h-[60vh] text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <h1 className="text-2xl font-bold mb-2">
                {language === 'ar' ? 'لم يتم العثور على PDF' : 'PDF Not Found'}
              </h1>
              <p className="text-muted-foreground mb-6">
                {language === 'ar' 
                  ? 'لا يمكننا العثور على ملف PDF الذي تبحث عنه. قد يكون قد تم حذفه أو نقله.'
                  : 'We cannot find the PDF you are looking for. It may have been deleted or moved.'
                }
              </p>
              <Button asChild>
                <Link to="/pdfs">
                  {language === 'ar' ? 'عرض كل ملفات PDF' : 'View All PDFs'}
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SEO 
        title={pdf.title || 'PDF Viewer'} 
        description={pdf.summary || 'View and analyze PDF document'} 
      />
      <Navbar />
      
      <main className="flex-1 p-2 md:p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          {/* PDF header section */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <div className="mb-1 flex items-center">
                <Link 
                  to="/pdfs" 
                  className="mr-2 inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  {language === 'ar' ? 'العودة' : 'Back'}
                </Link>
                
                <h1 className="text-xl font-bold truncate mr-2">{pdf.title}</h1>
                
                {pdf.id.startsWith('temp-') && (
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    {language === 'ar' ? 'مؤقت' : 'Temporary'}
                  </Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>{pdf.pageCount || numPages || '?'} {language === 'ar' ? 'صفحة' : 'pages'}</span>
                <span>•</span>
                <span>{pdf.fileSize}</span>
                <span>•</span>
                <span>{pdf.uploadDate}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={copyLinkToClipboard}
                    >
                      <Share className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'ar' ? 'مشاركة' : 'Share'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleDownload}
                    >
                      <DownloadCloud className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'ar' ? 'تنزيل' : 'Download'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={handleDeletePDF}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{language === 'ar' ? 'حذف' : 'Delete'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* PDF viewer and chat section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {/* PDF viewer */}
            <div className="md:col-span-2 bg-background rounded-lg border shadow overflow-hidden">
              <div className="p-2 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'عارض PDF' : 'PDF Viewer'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => changePage(-1)}
                    disabled={pageNumber <= 1}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <span className="text-xs">
                    {pageNumber} / {numPages || '?'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => changePage(1)}
                    disabled={!numPages || pageNumber >= numPages}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex justify-center items-center bg-muted/20 min-h-[600px] overflow-auto p-4">
                <Document
                  file={pdf.fileUrl || (pdf.file as Blob)}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  }
                  error={
                    <div className="flex flex-col justify-center items-center h-full text-center p-4">
                      <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === 'ar' 
                          ? 'فشل تحميل PDF. قد يكون الملف تالفًا أو محميًا بكلمة مرور.' 
                          : 'Failed to load PDF. The file may be corrupted or password protected.'
                        }
                      </p>
                      <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                        <RefreshCw className="h-3 w-3 mr-1" />
                        {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                      </Button>
                    </div>
                  }
                  className="max-w-full"
                >
                  <Page
                    pageNumber={pageNumber}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="page"
                    scale={1}
                  />
                </Document>
              </div>
              
              <div className="p-2 border-t flex justify-between items-center bg-muted/30">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setShowChat(!showChat)}
                >
                  {showChat 
                    ? (language === 'ar' ? 'إخفاء المحادثة' : 'Hide Chat') 
                    : (language === 'ar' ? 'إظهار المحادثة' : 'Show Chat')
                  }
                </Button>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setPageNumber(1)}
                    disabled={pageNumber === 1}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2" align="end">
                      <div className="grid gap-1">
                        <Button variant="ghost" size="sm" className="justify-start text-xs">
                          <RotateCw className="mr-2 h-3 w-3" />
                          {language === 'ar' ? 'تدوير' : 'Rotate'}
                        </Button>
                        <Button variant="ghost" size="sm" className="justify-start text-xs">
                          <Copy className="mr-2 h-3 w-3" />
                          {language === 'ar' ? 'نسخ النص' : 'Copy Text'}
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            {/* Chat section */}
            <div className={`bg-background rounded-lg border shadow overflow-hidden flex flex-col ${showChat ? '' : 'hidden md:flex'}`}>
              <div className="p-2 border-b flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'تحليل الذكاء الاصطناعي' : 'AI Analysis'}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowOnlineUsers(!showOnlineUsers)}
                  >
                    <User className="h-4 w-4" />
                    {onlineUsers.length > 0 && (
                      <span className="absolute top-0 right-0 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
              
              {showOnlineUsers && onlineUsers.length > 0 && (
                <div className="p-2 border-b bg-muted/10">
                  <p className="text-xs font-medium mb-1">
                    {language === 'ar' ? 'المستخدمون المتصلون' : 'Online Users'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {onlineUsers.map((onlineUser) => (
                      <div 
                        key={onlineUser.id}
                        className="flex items-center bg-muted/30 rounded-full px-2 py-1"
                      >
                        <div className="relative mr-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[10px]">
                              {onlineUser.email?.charAt(0).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full bg-green-500"></span>
                        </div>
                        <span className="text-xs truncate max-w-[100px]">
                          {onlineUser.email || 'User'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chat messages */}
              <ScrollArea className="flex-1" ref={chatContainerRef}>
                <div className="p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <h3 className="text-lg font-medium">
                        {language === 'ar' ? 'أرسل سؤالاً حول PDF' : 'Ask a question about this PDF'}
                      </h3>
                      <p className="text-muted-foreground text-sm mt-1">
                        {language === 'ar'
                          ? 'استخدم المحادثة للحصول على ملخصات أو طرح أسئلة حول المستند'
                          : 'Use the chat to get summaries or ask questions about the document'
                        }
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <Card
                        key={message.id}
                        className={cn(
                          "p-3",
                          message.isUser
                            ? "bg-primary/10 border-primary/10"
                            : "bg-background"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {message.isUser ? (user?.email?.charAt(0).toUpperCase() || 'U') : 'AI'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center">
                              <p className="text-xs font-medium">
                                {message.isUser 
                                  ? (user?.email || (language === 'ar' ? 'أنت' : 'You'))
                                  : (language === 'ar' ? 'مساعد الذكاء الاصطناعي' : 'AI Assistant')
                                }
                              </p>
                              <time className="ml-auto text-xs text-muted-foreground">
                                {message.timestamp instanceof Date 
                                  ? message.timestamp.toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : new Date(message.timestamp).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                }
                              </time>
                            </div>
                            
                            {message.isUser ? (
                              <p className="text-sm">{message.content}</p>
                            ) : (
                              <MarkdownMessage 
                                content={message.content} 
                                className={language === 'ar' ? 'text-right' : ''}
                              />
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                  
                  {isAnalyzing && (
                    <div>
                      <ChatMessageSkeleton />
                      <PDFAnalysisProgress analysis={analysisProgress} />
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <ChatInput 
                onSubmit={handleChatSubmit}
                disabled={isAnalyzing}
                dir={dir}
                placeholder={language === 'ar' ? 'اكتب سؤالاً حول هذا PDF...' : 'Type a question about this PDF...'}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PDFViewer;
