
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { ArrowLeft, FileText, Share, Send, DownloadCloud, ChevronUp, ChevronDown, AlertTriangle, Trash2, Brain, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';
import { Skeleton, ChatMessageSkeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  deletePDF as deleteSupabasePDF,
  deleteAllChatMessagesForPDF
} from '@/services/pdfSupabaseService';
import {
  extractTextFromPDF,
  analyzePDFWithGemini,
  AnalysisProgress,
  AnalysisStage
} from '@/services/pdfAnalysisService';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !id || !pdf) return;

    const userMessageContent = chatInput.trim();
    setChatInput('');
    
    try {
      let savedUserMessage: ChatMessage | null = null;
      
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
        
        let savedAiMessage: ChatMessage | null = null;
        
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
                timestamp: new Date()
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
              timestamp: result.timestamp
            };
          }
        } else {
          savedAiMessage = addChatMessageToPDF(id, {
            content: aiContent,
            isUser: false,
            timestamp: new Date()
          });
        }
        
        if (savedAiMessage) {
          setChatMessages(prev => [...prev, savedAiMessage!]);
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
          
        let savedFallbackMessage: ChatMessage | null = null;
        
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

  const handleDownload = async () => {
    if (!pdf?.dataUrl) {
      toast.error(language === 'ar' ? 'رابط الملف غير متوفر' : 'File URL not available');
      return;
    }
    
    try {
      const a = document.createElement('a');
      a.href = pdf.dataUrl;
      a.download = pdf.title;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success(language === 'ar' ? 'جارٍ تنزيل الملف...' : 'Downloading PDF...');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(language === 'ar' ? 'فشل في تنزيل الملف' : 'Failed to download PDF');
    }
  };

  const generateSummary = async () => {
    if (!pdfTextContent && !pdf?.dataUrl) {
      toast.error(language === 'ar' ? 'محتوى الملف غير متوفر' : 'PDF content not available');
      return;
    }
    
    toast.info(language === 'ar' ? 'جاري تلخيص الملف...' : 'Generating summary...');
    
    try {
      setIsWaitingForResponse(true);
      let textContent = pdfTextContent;
      
      if (!textContent) {
        textContent = await extractPDFContent();
      }
      
      if (!textContent) {
        throw new Error('Failed to extract PDF content');
      }
      
      const summaryPrompt = language === 'ar' 
        ? 'قم بتلخيص هذا المستند بطريقة شاملة وموجزة'
        : 'Provide a comprehensive summary of this document';
        
      setAnalysisProgress({
        stage: 'generating',
        progress: 50,
        message: language === 'ar' ? 'إنشاء ملخص للمستند...' : 'Generating document summary...'
      });
      
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: language === 'ar' ? 'تلخيص المستند' : 'Summarize this document',
        isUser: true,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      const summary = await analyzePDFWithGemini(textContent, summaryPrompt, updateAnalysisProgress);
      
      const aiMessage: ChatMessage = {
        id: `temp-${Date.now() + 1}`,
        content: summary,
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (user && !isTempPdf) {
        await addSupabaseChatMessage(id as string, userMessage.content, true);
        await addSupabaseChatMessage(id as string, aiMessage.content, false);
      } else if (isTempPdf) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (!parsedData.fileData.chatMessages) {
              parsedData.fileData.chatMessages = [];
            }
            parsedData.fileData.chatMessages.push(userMessage, aiMessage);
            sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
          } catch (error) {
            console.error('Error updating temporary PDF chat messages:', error);
          }
        }
      } else {
        addChatMessageToPDF(id as string, {
          content: userMessage.content,
          isUser: true,
          timestamp: new Date()
        });
        addChatMessageToPDF(id as string, {
          content: aiMessage.content,
          isUser: false,
          timestamp: new Date()
        });
      }
      
      setAnalysisProgress({
        stage: 'complete',
        progress: 100,
        message: language === 'ar' ? 'تم إنشاء الملخص بنجاح' : 'Summary generated successfully'
      });
      
    } catch (error) {
      console.error('Error generating summary:', error);
      setAnalysisProgress({
        stage: 'error',
        progress: 0,
        message: language === 'ar' ? 'فشل في إنشاء الملخص' : 'Failed to generate summary'
      });
      
      toast.error(language === 'ar' ? 'فشل في إنشاء الملخص' : 'Failed to generate summary');
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const translatePDF = async () => {
    if (!pdfTextContent && !pdf?.dataUrl) {
      toast.error(language === 'ar' ? 'محتوى الملف غير متوفر' : 'PDF content not available');
      return;
    }
    
    const targetLanguage = language === 'ar' ? 'English' : 'Arabic';
    toast.info(language === 'ar' 
      ? `جاري ترجمة المستند إلى ${targetLanguage}...` 
      : `Translating document to ${targetLanguage}...`);
    
    try {
      setIsWaitingForResponse(true);
      let textContent = pdfTextContent;
      
      if (!textContent) {
        textContent = await extractPDFContent();
      }
      
      if (!textContent) {
        throw new Error('Failed to extract PDF content');
      }
      
      const translatePrompt = language === 'ar' 
        ? `ترجم هذا المستند إلى اللغة ${targetLanguage}` 
        : `Translate this document to ${targetLanguage}`;
        
      setAnalysisProgress({
        stage: 'generating',
        progress: 50,
        message: language === 'ar' 
          ? `ترجمة المستند إلى ${targetLanguage}...` 
          : `Translating document to ${targetLanguage}...`
      });
      
      const userMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: translatePrompt,
        isUser: true,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      
      const translation = await analyzePDFWithGemini(textContent, translatePrompt, updateAnalysisProgress);
      
      const aiMessage: ChatMessage = {
        id: `temp-${Date.now() + 1}`,
        content: translation,
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      if (user && !isTempPdf) {
        await addSupabaseChatMessage(id as string, userMessage.content, true);
        await addSupabaseChatMessage(id as string, aiMessage.content, false);
      } else if (isTempPdf) {
        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          try {
            const parsedData = JSON.parse(tempPdfData);
            if (!parsedData.fileData.chatMessages) {
              parsedData.fileData.chatMessages = [];
            }
            parsedData.fileData.chatMessages.push(userMessage, aiMessage);
            sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
          } catch (error) {
            console.error('Error updating temporary PDF chat messages:', error);
          }
        }
      } else {
        addChatMessageToPDF(id as string, {
          content: userMessage.content,
          isUser: true,
          timestamp: new Date()
        });
        addChatMessageToPDF(id as string, {
          content: aiMessage.content,
          isUser: false,
          timestamp: new Date()
        });
      }
      
      setAnalysisProgress({
        stage: 'complete',
        progress: 100,
        message: language === 'ar' ? 'تمت الترجمة بنجاح' : 'Translation completed successfully'
      });
      
    } catch (error) {
      console.error('Error translating PDF:', error);
      setAnalysisProgress({
        stage: 'error',
        progress: 0,
        message: language === 'ar' ? 'فشل في ترجمة المستند' : 'Failed to translate document'
      });
      
      toast.error(language === 'ar' ? 'فشل في ترجمة المستند' : 'Failed to translate document');
    } finally {
      setIsWaitingForResponse(false);
    }
  };

  const clearChatMessages = () => {
    if (!id || !pdf) return;
    
    if (window.confirm(language === 'ar' 
      ? 'هل أنت متأكد من أنك تريد حذف جميع الرسائل؟' 
      : 'Are you sure you want to delete all messages?')) {
      
      try {
        if (isTempPdf) {
          const tempPdfData = sessionStorage.getItem('tempPdfFile');
          if (tempPdfData) {
            try {
              const parsedData = JSON.parse(tempPdfData);
              parsedData.fileData.chatMessages = [];
              sessionStorage.setItem('tempPdfFile', JSON.stringify(parsedData));
              setChatMessages([]);
            } catch (error) {
              console.error('Error clearing temporary PDF chat messages:', error);
              toast.error(language === 'ar' 
                ? 'فشل في حذف الرسائل' 
                : 'Failed to delete messages');
            }
          }
        } else if (user) {
          const deleteAllMessages = async () => {
            try {
              const success = await deleteAllChatMessagesForPDF(id);
              if (success) {
                setChatMessages([]);
                toast.success(language === 'ar' 
                  ? 'تم حذف جميع الرسائل بنجاح' 
                  : 'All messages deleted successfully');
              } else {
                toast.error(language === 'ar' 
                  ? 'فشل في حذف الرسائل' 
                  : 'Failed to delete messages');
              }
            } catch (error) {
              console.error('Error deleting chat messages:', error);
              toast.error(language === 'ar' 
                ? 'فشل في حذف الرسائل' 
                : 'Failed to delete messages');
            }
          };
          
          deleteAllMessages();
        } else {
          const updatedPdf = { ...pdf, chatMessages: [] };
          savePDF(updatedPdf);
          setChatMessages([]);
          toast.success(language === 'ar' 
            ? 'تم حذف جميع الرسائل بنجاح' 
            : 'All messages deleted successfully');
        }
      } catch (error) {
        console.error('Error clearing chat messages:', error);
        toast.error(language === 'ar' 
          ? 'فشل في حذف الرسائل' 
          : 'Failed to delete messages');
      }
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
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1 text-xs py-1 px-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <DownloadCloud className="h-3.5 w-3.5" />
                  <span>{language === 'ar' ? 'تنزيل' : 'Download'}</span>
                </button>
              </div>
              
              {isLoadingPdf ? (
                <div className="flex items-center justify-center p-10">
                  <div className="text-center">
                    <Skeleton className="h-32 w-32 rounded-lg mx-auto mb-4" />
                    <Skeleton className="h-4 w-40 mx-auto" />
                  </div>
                </div>
              ) : pdfError ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'ar' ? 'خطأ في تحميل الملف' : 'Error Loading PDF'}
                  </h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    {pdfError}
                  </p>
                  <Button onClick={handleRetryLoading} variant="outline">
                    {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
                  </Button>
                </div>
              ) : (
                <div className="pdf-container relative">
                  {numPages && showPdfControls && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm border border-border rounded-full shadow-sm px-2 py-1 flex items-center space-x-1">
                      <Button 
                        onClick={handlePrevPage} 
                        disabled={pageNumber <= 1} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <ChevronDown className="rotate-90 h-4 w-4" />
                      </Button>
                      <span className="text-xs font-medium">
                        {pageNumber} / {numPages}
                      </span>
                      <Button 
                        onClick={handleNextPage} 
                        disabled={pageNumber >= numPages} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <ChevronUp className="rotate-90 h-4 w-4" />
                      </Button>
                      <div className="h-4 w-px bg-border mx-1" />
                      <Button 
                        onClick={handleZoomOut} 
                        disabled={pdfScale <= 0.5} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <span className="text-xs font-bold">-</span>
                      </Button>
                      <span className="text-xs">
                        {Math.round(pdfScale * 100)}%
                      </span>
                      <Button 
                        onClick={handleZoomIn} 
                        disabled={pdfScale >= 2.0} 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                      >
                        <span className="text-xs font-bold">+</span>
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex justify-center p-4 min-h-[500px] bg-muted/20">
                    <Document
                      file={pdf.dataUrl}
                      onLoadSuccess={handleDocumentLoadSuccess}
                      onLoadError={handleDocumentLoadError}
                      loading={<Skeleton className="h-[600px] w-full max-w-lg rounded-lg" />}
                      error={
                        <div className="flex flex-col items-center justify-center p-10 text-center">
                          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            {language === 'ar' ? 'خطأ في تحميل الملف' : 'Error Loading PDF'}
                          </h3>
                        </div>
                      }
                    >
                      <Page 
                        pageNumber={pageNumber} 
                        scale={pdfScale}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        className="pdf-page"
                      />
                    </Document>
                  </div>
                </div>
              )}
            </div>
            
            <div className="lg:w-1/3">
              <div className={cn(
                "bg-card border border-border rounded-xl shadow-sm overflow-hidden h-full transition-all",
                showChat ? "opacity-100" : "opacity-80 hover:opacity-100"
              )}>
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="font-medium">
                    {language === 'ar' ? 'محادثة حول الملف' : 'Chat with PDF'}
                  </h2>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={generateSummary}
                      className="inline-flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors"
                      title={language === 'ar' ? 'تلخيص المستند' : 'Summarize Document'}
                    >
                      <Brain className="h-4 w-4" />
                    </button>
                    <button
                      onClick={translatePDF}
                      className="inline-flex items-center justify-center p-2 rounded-full hover:bg-muted transition-colors"
                      title={language === 'ar' ? 'ترجمة المستند' : 'Translate Document'}
                    >
                      <Languages className="h-4 w-4" />
                    </button>
                    <button
                      onClick={clearChatMessages}
                      disabled={chatMessages.length === 0}
                      className={cn(
                        "inline-flex items-center justify-center p-2 rounded-full transition-colors",
                        chatMessages.length === 0 
                          ? "text-muted-foreground/50 cursor-not-allowed" 
                          : "text-destructive hover:bg-destructive/10"
                      )}
                      title={language === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <ScrollArea className="h-[600px] p-4">
                  {chatMessages.length === 0 && !isLoadingMessages ? (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <FileText className="h-10 w-10 text-muted-foreground mb-2 opacity-70" />
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {language === 'ar' 
                          ? 'استخدم المحادثة للسؤال عن أي شيء في هذا المستند.' 
                          : 'Use the chat to ask anything about this document.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {isLoadingMessages ? (
                        <>
                          <ChatMessageSkeleton isUser={true} />
                          <ChatMessageSkeleton isUser={false} />
                          <ChatMessageSkeleton isUser={true} />
                        </>
                      ) : (
                        chatMessages.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              "mb-4 p-3 rounded-lg max-w-[90%]",
                              message.isUser
                                ? "bg-primary/10 ml-auto rounded-br-none"
                                : "bg-muted mr-auto rounded-bl-none"
                            )}
                          >
                            <div className="text-sm whitespace-pre-wrap prose-sm dark:prose-invert prose">
                              {message.content}
                            </div>
                          </div>
                        ))
                      )}
                      
                      {isAnalyzing && (
                        <div className="mb-4">
                          <PDFAnalysisProgress progress={analysisProgress} />
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </>
                  )}
                  <ScrollBar />
                </ScrollArea>
                
                <div className="p-4 border-t">
                  <form onSubmit={handleChatSubmit} className="flex items-end gap-2">
                    <Textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={
                        language === 'ar'
                          ? 'اكتب سؤالك حول هذا المستند...'
                          : 'Type your question about this document...'
                      }
                      className="min-h-12 max-h-32"
                      disabled={isWaitingForResponse}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!chatInput.trim() || isWaitingForResponse}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PDFViewer;
