import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { 
  ArrowLeft, FileText, Share, Send, DownloadCloud, ChevronUp, ChevronDown, 
  AlertTriangle, Trash2, Lightbulb, BookOpen, List, Sparkles, Star,
  Bookmark, CheckCircle, FileQuestion, ExternalLink, Copy
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';
import { Skeleton, ChatMessageSkeleton, KeyPointsSkeleton } from '@/components/ui/skeleton';
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

// New interfaces for key points
interface KeyPoint {
  text: string;
  type: 'insight' | 'action' | 'quote';
}

interface EnhancedChatMessage extends ChatMessage {
  keyPoints?: KeyPoint[];
}

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfScale, setPdfScale] = useState(1.0);
  const [showPdfControls, setShowPdfControls] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<EnhancedChatMessage[]>([]);
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
  const [showKeyPoints, setShowKeyPoints] = useState<Record<string, boolean>>({});

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
              setPdf(parsedData.fileData);
              setChatMessages(parsedData.fileData.chatMessages || []);
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

      const loadedPdf = getPDFById(id);
      if (loadedPdf) {
        setPdf(loadedPdf);
        if (loadedPdf.chatMessages) {
          setChatMessages(loadedPdf.chatMessages);
        }
        
        if (!loadedPdf.dataUrl) {
          if (user) {
            tryLoadFromSupabase(id);
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
          
          setIsLoadingMessages(true);
          const messages = await getChatMessagesForPDF(pdfId);
          if (messages && messages.length > 0) {
            const convertedMessages: ChatMessage[] = messages.map(msg => ({
              id: msg.id,
              content: msg.content,
              isUser: msg.isUser,
              timestamp: msg.timestamp
            }));
            
            setChatMessages(convertedMessages);
          }
          setIsLoadingMessages(false);
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

  const updateAnalysisProgress = (progress: AnalysisProgress) => {
    setAnalysisProgress(progress);
  };

  const extractPDFContent = async () => {
    if (!pdf?.dataUrl || pdfTextContent) return;
    
    try {
      setAnalysisProgress({
        stage: 'extracting',
        progress: 10,
        message: language === 'ar' 
          ? 'بدء استخراج النص من ملف PDF...' 
          : 'Starting text extraction from PDF...'
      });
      
      const text = await extractTextFromPDF(pdf.dataUrl, updateAnalysisProgress);
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

  // Helper function to extract key points from AI responses
  const extractKeyPoints = (content: string): KeyPoint[] => {
    // Simple heuristic to identify potential key points in the content
    const points: KeyPoint[] = [];
    
    // Look for insights (important concepts, definitions, etc.)
    const insightPatterns = [
      /important\s+(?:point|concept|idea)(?:s)?.*?:([^\.]+)/gi,
      /key\s+(?:point|concept|takeaway|finding)(?:s)?.*?:([^\.]+)/gi,
      /(?:major|main|critical)\s+(?:point|concept|idea)(?:s)?.*?:([^\.]+)/gi,
      /(?:According to|The book states|The author notes|The text mentions)([^\.]+)/gi
    ];
    
    // Look for action items or recommendations
    const actionPatterns = [
      /(?:recommend|suggest|advise)(?:s|ed)?(?:\s+that)?([^\.]+)/gi,
      /(?:should|could|must|need to)([^\.]+)/gi,
      /(?:action|step|task|todo)(?:s)?(?:\s+to\s+take)?.*?:([^\.]+)/gi
    ];
    
    // Look for notable quotes or passages
    const quotePatterns = [
      /"([^"]+)"/g,
      /'([^']+)'/g,
      /page\s+\d+(?:\s*-\s*\d+)?(?:\s*:|,)?([^\.]+)/gi
    ];
    
    // Extract all matches from each pattern group
    insightPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 10 && !points.some(p => p.text === text)) {
          points.push({ text, type: 'insight' });
        }
      }
    });
    
    actionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 10 && !points.some(p => p.text === text)) {
          points.push({ text, type: 'action' });
        }
      }
    });
    
    quotePatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const text = match[1].trim();
        if (text.length > 10 && !points.some(p => p.text === text)) {
          points.push({ text, type: 'quote' });
        }
      }
    });
    
    // If we couldn't find any patterns, create some generic ones based on paragraphs
    if (points.length === 0) {
      const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      if (paragraphs.length > 1) {
        // Use first 2-3 paragraphs as points
        const useParagraphs = paragraphs.slice(0, Math.min(3, paragraphs.length));
        useParagraphs.forEach(p => {
          // Take first sentence of each paragraph
          const firstSentence = p.split(/\.\s+/)[0].trim();
          if (firstSentence.length > 15 && firstSentence.length < 150) {
            points.push({ text: firstSentence, type: 'insight' });
          }
        });
      }
    }
    
    // Limit to at most 3 points
    return points.slice(0, 3);
  };

  // Toggle key points visibility
  const toggleKeyPoints = (messageId: string) => {
    setShowKeyPoints(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(language === 'ar' ? 'تم النسخ إلى الحافظة' : 'Copied to clipboard');
  };

  // Handle action button clicks
  const handleActionClick = (action: string, messageContent: string) => {
    switch (action) {
      case 'summarize':
        setChatInput(`Can you summarize the main points of the document?`);
        break;
      case 'keyPoints':
        setChatInput(`What are the key takeaways from this document?`);
        break;
      case 'explain':
        setChatInput(`Can you explain the concept of "${messageContent.split(' ').slice(0, 3).join(' ')}..." in simpler terms?`);
        break;
      default:
        break;
    }
  };

  // Modified handleChatSubmit to include key points extraction
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !id || !pdf) return;

    const userMessageContent = chatInput.trim();
    setChatInput('');
    
    try {
      let savedUserMessage: EnhancedChatMessage | null = null;
      
      if (isTempPdf) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (!parsedData.fileData.chatMessages) {
              parsedData.fileData.chatMessages = [];
            }
            
            savedUserMessage = {
              id: `temp-msg-${Date.now()}`,
              content: userMessageContent,
              isUser: true,
              timestamp: new Date()
            };
            
            parsedData.fileData.chatMessages.push(savedUserMessage);
            
            sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
          } catch (error) {
            console.error('Error adding user message to temporary PDF:', error);
          }
        }
      } else if (user) {
        const result = await addSupabaseChatMessage(id, userMessageContent, true);
        if (result) {
          savedUserMessage = {
            id: result.id,
            content: result.content,
            isUser: result.isUser,
            timestamp: result.timestamp
          };
        }
      } else {
        savedUserMessage = addChatMessageToPDF(id, {
          content: userMessageContent,
          isUser: true,
          timestamp: new Date()
        });
      }
      
      if (savedUserMessage) {
        setChatMessages(prev => [...prev, savedUserMessage!]);
      }

      setIsAnalyzing(true);
      setIsWaitingForResponse(true);
      
      try {
        let textContent = pdfTextContent;
        if (!textContent) {
          setAnalysisProgress({
            stage: 'extracting',
            progress: 25,
            message: language === 'ar'
              ? 'استخراج النص من ملف PDF...'
              : 'Extracting text from PDF...'
          });
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
        
        const aiContent = await analyzePDFWithGemini(textContent, userMessageContent, updateAnalysisProgress);
        
        // Extract key points from AI response
        const keyPoints = extractKeyPoints(aiContent);
        
        let savedAiMessage: EnhancedChatMessage | null = null;
        
        if (isTempPdf) {
          const tempPdfData = sessionStorage.getItem('tempPdfFile');
          if (tempPdfData) {
            try {
              const parsedData = JSON.parse(tempPdfData);
              if (!parsedData.fileData.chatMessages) {
                parsedData.fileData.chatMessages = [];
              }
              
              savedAiMessage = {
                id: `temp-msg-${Date.now()}`,
                content: aiContent,
                isUser: false,
                timestamp: new Date(),
                keyPoints: keyPoints
              };
              
              parsedData.fileData.chatMessages.push(savedAiMessage);
              
              sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
            } catch (error) {
              console.error('Error adding AI message to temporary PDF:', error);
            }
          }
        } else if (user) {
          const result = await addSupabaseChatMessage(id, aiContent, false);
          if (result) {
            savedAiMessage = {
              id: result.id,
              content: result.content,
              isUser: result.isUser,
              timestamp: result.timestamp,
              keyPoints: keyPoints
            };
          }
        } else {
          const baseMessage = addChatMessageToPDF(id, {
            content: aiContent,
            isUser: false,
            timestamp: new Date()
          });
          
          if (baseMessage) {
            savedAiMessage = {
              ...baseMessage,
              keyPoints: keyPoints
            };
          }
        }
        
        if (savedAiMessage) {
          setChatMessages(prev => [...prev, savedAiMessage!]);
          // Auto-show key points for this new message
          setShowKeyPoints(prev => ({
            ...prev,
            [savedAiMessage!.id]: true
          }));
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
          
        let savedFallbackMessage: EnhancedChatMessage | null = null;
        
        if (isTempPdf) {
          const tempPdfData = sessionStorage.getItem('tempPdfFile');
          if (tempPdfData) {
            try {
              const parsedData = JSON.parse(tempPdfData);
              if (!parsedData.fileData.chatMessages) {
                parsedData.fileData.chatMessages = [];
              }
              
              savedFallbackMessage = {
                id: `temp-msg-${Date.now()}`,
                content: fallbackResponse,
                isUser: false,
                timestamp: new Date()
              };
              
              parsedData.fileData.chatMessages.push(savedFallbackMessage);
              
              sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
            } catch (error) {
              console.error('Error adding fallback message to temporary PDF:', error);
            }
          }
        } else if (user) {
          const result = await addSupabaseChatMessage(id, fallbackResponse, false);
          if (result) {
            savedFallbackMessage = {
              id: result.id,
              content: result.content,
              isUser: result.isUser,
              timestamp: result.timestamp
            };
          }
        } else {
          savedFallbackMessage = addChatMessageToPDF(id, {
            content: fallbackResponse,
            isUser: false,
            timestamp: new Date()
          });
        }
        
        if (savedFallbackMessage) {
          setChatMessages(prev => [...prev, savedFallbackMessage!]);
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

  // Update the rendering of chat messages to include key points
  const renderChatMessages = () => {
    if (isLoadingMessages) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="h-10 w-10 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
        </div>
      );
    }
    
    if (chatMessages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <p className="font-medium mb-2">
            {language === 'ar' ? 'اطرح سؤالاً حول هذا الملف' : 'Ask a question about this PDF'}
          </p>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'يمكنك طرح أسئلة حول محتوى الملف والحصول على إجابات دقيقة باستخدام الذكاء الاصطناعي من Gemini'
              : 'Ask questions about the PDF content and get accurate AI-powered answers from Gemini'
            }
          </p>
          {isTempPdf && (
            <p className="text-xs text-amber-600 mt-4">
              {language === 'ar'
                ? 'ملاحظة: هذا ملف مؤقت. سيتم فقدان المحادثة عند إغلاق المتصفح.'
                : 'Note: This is a temporary file. Chat will be lost when you close the browser.'}
            </p>
          )}
        </div>
      );
    }
    
    return (
      <>
        {chatMessages.map(message => (
          <div 
            key={message.id}
            className={cn(
              "flex flex-col p-3 rounded-lg max-w-[90%]",
              message.isUser 
                ? "ml-auto bg-primary text-primary-foreground" 
                : "mr-auto bg-muted"
            )}
          >
            <div className="whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            {!message.isUser && message.keyPoints && message.keyPoints.length > 0 && (
              <div className="mt-3 pt-3 border-t border-muted/30">
                <div 
                  className="flex items-center gap-2 cursor-pointer mb-2" 
                  onClick={() => toggleKeyPoints(message.id)}
                >
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'النقاط الرئيسية' : 'Key Points'}
                  </span>
                  {showKeyPoints[message.id] ? 
                    <ChevronUp className="h-4 w-4 opacity-70" /> : 
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  }
                </div>
                
                {showKeyPoints[message.id] && (
                  <div className="space-y-2 text-sm">
                    {message.keyPoints.map((point, index) => (
                      <div key={index} className="flex items-start gap-2 group">
                        {point.type === 'insight' && <Star className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />}
                        {point.type === 'action' && <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />}
                        {point.type === 'quote' && <BookOpen className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />}
                        <p className="flex-1">{point.text}</p>
                        <button 
                          onClick={() => copyToClipboard(point.text)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Copy text"
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {!message.isUser && !message.keyPoints && (
              <KeyPointsSkeleton />
            )}
            
            {!message.isUser && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-muted/30">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-muted/50 hover:bg-muted flex items-center gap-1.5 h-8 text-xs"
                  onClick={() => handleActionClick('summarize', message.content)}
                >
                  <List className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'ملخص' : 'Summarize'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-muted/50 hover:bg-muted flex items-center gap-1.5 h-8 text-xs"
                  onClick={() => handleActionClick('keyPoints', message.content)}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'النقاط الرئيسية' : 'Key Points'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-full bg-muted/50 hover:bg-muted flex items-center gap-1.5 h-8 text-xs"
                  onClick={() => handleActionClick('explain', message.content)}
                >
                  <FileQuestion className="h-3.5 w-3.5" />
                  {language === 'ar' ? 'اشرح أكثر' : 'Explain More'}
                </Button>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs opacity-70">
                {message.timestamp instanceof Date 
                  ? message.timestamp.toLocaleTimeString() 
                  : new Date(message.timestamp).toLocaleTimeString()
                }
              </span>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </>
    );
  };

  // Update the return JSX to use the new renderChatMessages function
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
              <ArrowLeft className={`h-4 w-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
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
              <button
                onClick={handleDeletePDF}
                className="inline
