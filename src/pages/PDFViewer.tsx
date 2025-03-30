
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
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getPDFById as getLocalPDFById,
  addChatMessageToPDF as addLocalChatMessage,
  savePDF as saveLocalPDF,
  deletePDFById as deleteLocalPDFById
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
import { UploadedPDF, SupabasePDF, ChatMessage, BasePDF } from '@/services/pdfTypes';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<UploadedPDF | SupabasePDF | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: AnalysisStage.NotStarted,
    progress: 0,
    message: 'Ready to analyze'
  });
  const [showAllPages, setShowAllPages] = useState<boolean>(true);
  const [chatExpanded, setChatExpanded] = useState<boolean>(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPdfLoaded, setIsPdfLoaded] = useState<boolean>(false);
  const [isSupabasePDF, setIsSupabasePDF] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      const fetchPDF = async () => {
        try {
          // Try to fetch from Supabase first if user is logged in
          if (user) {
            const pdfData = await getSupabasePDFById(id);
            if (pdfData) {
              setPdf(pdfData);
              setNumPages(pdfData.pageCount || 0);
              setIsPdfLoaded(true);
              setIsSupabasePDF(true);
              
              // Fetch chat messages
              const messages = await getChatMessagesForPDF(id);
              setChatMessages(messages);
              return;
            }
          }
          
          // If not found in Supabase or user not logged in, try local storage
          const localPdfData = await getLocalPDFById(id);
          if (localPdfData) {
            setPdf(localPdfData);
            setNumPages(localPdfData.pageCount || localPdfData.numPages || 0);
            setIsPdfLoaded(true);
            setIsSupabasePDF(false);
            
            // Get messages from local storage
            if (id.startsWith('temp_')) {
              const storedMessages = sessionStorage.getItem(`chat_${id}`);
              if (storedMessages) {
                setChatMessages(JSON.parse(storedMessages));
              }
            } else {
              const storedMessages = localStorage.getItem(`chat_${id}`);
              if (storedMessages) {
                setChatMessages(JSON.parse(storedMessages));
              }
            }
          } else {
            console.error("PDF not found");
            toast.error("PDF not found");
          }
        } catch (error) {
          console.error("Error fetching PDF:", error);
          toast.error("Failed to load PDF");
        }
      };

      fetchPDF();
    }
  }, [id, user]);

  const handleSendMessage = async () => {
    if (!message.trim() || !pdf || isAnalyzing) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: message.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      userId: user?.id
    };
    
    // Add user message to the chat
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setMessage('');
    
    // Save the messages
    if (user && id && isSupabasePDF) {
      await addSupabaseChatMessage(id, userMessage.content, userMessage.isUser);
    } else if (id) {
      if (id.startsWith('temp_')) {
        sessionStorage.setItem(`chat_${id}`, JSON.stringify(updatedMessages));
      } else {
        localStorage.setItem(`chat_${id}`, JSON.stringify(updatedMessages));
      }
    }
    
    // Scroll to bottom of chat
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);
    
    try {
      setIsAnalyzing(true);
      
      // Extract text from PDF if not already analyzed
      let pdfText = pdf.text || "";
      let pdfUrl = isSupabasePDF 
        ? (pdf as SupabasePDF).fileUrl 
        : (pdf as UploadedPDF).fileUrl || (pdf as UploadedPDF).dataUrl;
      
      if (!pdfText && pdfUrl) {
        pdfText = await extractTextFromPDF(
          pdfUrl,
          (progress) => setAnalysisProgress(progress)
        );
        
        // Save the extracted text
        if (user && id && isSupabasePDF) {
          await updatePDFMetadata(id, { 
            summary: `${pdf.summary} (Analyzed)` 
          });
        } else if (pdf && !isSupabasePDF) {
          const updatedPdf = { 
            ...pdf as UploadedPDF, 
            text: pdfText, 
            analyzed: true 
          };
          await saveLocalPDF(updatedPdf);
          setPdf(updatedPdf);
        }
      }
      
      // Analyze the PDF with the user's question
      const response = await analyzePDFWithGemini(
        pdfText,
        userMessage.content,
        (progress) => setAnalysisProgress(progress)
      );
      
      // Add AI response to chat
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response,
        isUser: false,
        timestamp: new Date().toISOString(),
        userId: "ai"
      };
      
      const finalMessages = [...updatedMessages, aiMessage];
      setChatMessages(finalMessages);
      
      // Save the messages
      if (user && id && isSupabasePDF) {
        await addSupabaseChatMessage(id, aiMessage.content, aiMessage.isUser);
      } else if (id) {
        if (id.startsWith('temp_')) {
          sessionStorage.setItem(`chat_${id}`, JSON.stringify(finalMessages));
        } else {
          localStorage.setItem(`chat_${id}`, JSON.stringify(finalMessages));
        }
      }
      
      // Reset analysis state
      setAnalysisProgress({
        stage: AnalysisStage.NotStarted,
        progress: 0,
        message: 'Ready for next question'
      });
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      toast.error("Failed to analyze PDF");
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "Sorry, I couldn't analyze the document. Please try again.",
        isUser: false,
        timestamp: new Date().toISOString(),
        userId: "ai"
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setChatMessages(finalMessages);
      
      // Save the messages
      if (user && id && isSupabasePDF) {
        await addSupabaseChatMessage(id, errorMessage.content, errorMessage.isUser);
      } else if (id) {
        if (id.startsWith('temp_')) {
          sessionStorage.setItem(`chat_${id}`, JSON.stringify(finalMessages));
        } else {
          localStorage.setItem(`chat_${id}`, JSON.stringify(finalMessages));
        }
      }
    } finally {
      setIsAnalyzing(false);
      
      // Scroll to bottom of chat
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const handleDeleteChat = async () => {
    if (!id) return;
    
    try {
      if (user && isSupabasePDF) {
        // Delete from Supabase if user is logged in
        await deleteAllChatMessagesForPDF(id);
      } else {
        // For temporary PDFs, use sessionStorage
        if (id.startsWith('temp_')) {
          sessionStorage.removeItem(`chat_${id}`);
        } else {
          // For local storage PDFs
          localStorage.removeItem(`chat_${id}`);
        }
      }
      
      setChatMessages([]);
      toast.success("Chat history deleted");
    } catch (error) {
      console.error("Error deleting chat history:", error);
      toast.error("Failed to delete chat history");
    }
  };

  const handleAnalyzePDF = async () => {
    if (!pdf || isAnalyzing) return;
    
    try {
      setIsAnalyzing(true);
      
      // Get the PDF URL
      let pdfUrl = isSupabasePDF 
        ? (pdf as SupabasePDF).fileUrl 
        : (pdf as UploadedPDF).fileUrl || (pdf as UploadedPDF).dataUrl;
      
      if (pdfUrl) {
        const pdfText = await extractTextFromPDF(
          pdfUrl,
          (progress) => setAnalysisProgress(progress)
        );
        
        // Save the extracted text
        if (user && id && isSupabasePDF) {
          await updatePDFMetadata(id, { 
            summary: `${pdf.summary} (Analyzed)` 
          });
        } else if (pdf && !isSupabasePDF) {
          const updatedPdf = { 
            ...pdf as UploadedPDF, 
            text: pdfText, 
            analyzed: true 
          };
          await saveLocalPDF(updatedPdf);
          setPdf(updatedPdf);
        }
        
        // Complete analysis
        setAnalysisProgress({
          stage: AnalysisStage.Complete,
          progress: 100,
          message: 'PDF analysis complete. You can now ask questions about the document.'
        });
        
        toast.success("PDF analyzed successfully");
      } else {
        throw new Error("PDF file URL not available");
      }
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      toast.error("Failed to analyze PDF");
      
      setAnalysisProgress({
        stage: AnalysisStage.Error,
        progress: 0,
        message: 'Failed to analyze PDF. Please try again.'
      });
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
      }, 1500);
    }
  };

  const fitToWidth = () => {
    if (document.querySelector('.react-pdf__Page')) {
      const pdfContainer = document.querySelector('.pdf-container');
      const pdfPage = document.querySelector('.react-pdf__Page');
      
      if (pdfContainer && pdfPage) {
        const containerWidth = pdfContainer.clientWidth;
        const pageWidth = pdfPage.clientWidth;
        
        // Account for padding/margins
        const newScale = (containerWidth - 40) / pageWidth;
        setScale(Math.min(newScale, 1.5)); // Limit max scale
      }
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsPdfLoaded(true);
    
    // Wait for the page to render before fitting width
    setTimeout(fitToWidth, 100);
    
    // Also fit on window resize
    window.addEventListener('resize', fitToWidth);
    return () => window.removeEventListener('resize', fitToWidth);
  };

  // Get the appropriate file URL for the PDF
  const getPdfUrl = () => {
    if (!pdf) return null;
    
    if (isSupabasePDF) {
      return (pdf as SupabasePDF).fileUrl;
    } else {
      return (pdf as UploadedPDF).fileUrl || (pdf as UploadedPDF).dataUrl;
    }
  };

  // Check if the PDF has been analyzed
  const isPdfAnalyzed = () => {
    if (!pdf) return false;
    
    return !!pdf.text || !!pdf.analyzed;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col flex-grow px-4 py-6 sm:container mx-auto space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold truncate max-w-[200px] sm:max-w-[300px]">
                {pdf?.title || 'Loading PDF...'}
              </h1>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-1" />
                <span>
                  {numPages 
                    ? `${numPages} ${language === 'ar' ? 'صفحة' : 'pages'}` 
                    : (language === 'ar' ? 'جاري التحميل...' : 'Loading...')}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setShowAllPages(!showAllPages)}>
              {showAllPages 
                ? (language === 'ar' ? 'عرض صفحة واحدة' : 'Single Page') 
                : (language === 'ar' ? 'عرض كل الصفحات' : 'All Pages')}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <DownloadCloud className="h-4 w-4 mr-1" />
              {language === 'ar' ? 'تحميل' : 'Download'}
            </Button>
            
            {user && (
              <Button variant="outline" size="sm" onClick={() => {/* Share functionality */}}>
                <Share className="h-4 w-4 mr-1" />
                {language === 'ar' ? 'مشاركة' : 'Share'}
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 flex-grow">
          <div className="pdf-container flex-grow lg:w-2/3 bg-white rounded-lg shadow-sm border overflow-hidden">
            {!pdf ? (
              <div className="flex items-center justify-center h-full p-8">
                <Skeleton className="h-[500px] w-full rounded-md" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-220px)]">
                <div className={cn(
                  "flex flex-col items-center p-4",
                  showAllPages ? "gap-4" : ""
                )}>
                  <Document
                    file={getPdfUrl()}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Skeleton className="h-[500px] w-full rounded-md" />}
                    error={
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold">
                          {language === 'ar' ? 'خطأ في تحميل ملف PDF' : 'Error loading PDF'}
                        </h3>
                        <p className="text-gray-500 mt-2">
                          {language === 'ar' ? 'يرجى المحاولة مرة أخرى' : 'Please try again'}
                        </p>
                      </div>
                    }
                  >
                    {showAllPages ? (
                      Array.from(new Array(numPages || 0), (_, index) => (
                        <Page
                          key={`page_${index + 1}`}
                          pageNumber={index + 1}
                          scale={scale}
                          className="border shadow-sm mb-4"
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center">
                        <Page
                          pageNumber={currentPage}
                          scale={scale}
                          className="border shadow-sm"
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                        
                        {numPages && numPages > 1 && (
                          <div className="flex items-center mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                              disabled={currentPage <= 1}
                            >
                              {language === 'ar' ? 'السابق' : 'Previous'}
                            </Button>
                            
                            <span className="mx-4">
                              {currentPage} / {numPages}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(currentPage + 1, numPages || 1))}
                              disabled={currentPage >= (numPages || 1)}
                            >
                              {language === 'ar' ? 'التالي' : 'Next'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Document>
                </div>
              </ScrollArea>
            )}
          </div>
          
          <div className="lg:w-1/3 flex flex-col bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-lg">
                  {language === 'ar' ? 'استكشف المستند' : 'Explore Document'}
                </h2>
                <Badge variant="outline" className="gap-1">
                  <Brain className="h-3 w-3" />
                  AI
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteChat}
                  className="h-8 w-8 rounded-full text-gray-500 hover:text-red-500"
                  title={language === 'ar' ? 'حذف المحادثة' : 'Delete Chat'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setChatExpanded(!chatExpanded)}
                  className="h-8 w-8 rounded-full"
                >
                  {chatExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div 
              className={cn(
                "flex-grow transition-all duration-300 overflow-hidden",
                !chatExpanded && "h-0"
              )}
            >
              {isAnalyzing ? (
                <PDFAnalysisProgress analysis={analysisProgress} />
              ) : (
                <ScrollArea 
                  className="h-[calc(100vh-360px)]" 
                  ref={chatContainerRef}
                >
                  <div className="flex flex-col p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                        <FileText className="h-12 w-12 mb-4 opacity-20" />
                        <p>{language === 'ar' ? 'اسأل عن المستند' : 'Ask about the document'}</p>
                      </div>
                    ) : (
                      chatMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex flex-col p-3 rounded-lg max-w-[85%]",
                            msg.isUser
                              ? "bg-primary text-primary-foreground ml-auto"
                              : "bg-muted mr-auto"
                          )}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <span className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            <div className="p-4 border-t">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'ar' ? 'اسأل سؤالاً...' : 'Ask a question...'}
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!message.trim() || isAnalyzing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              
              {pdf && !isPdfAnalyzed() && !isAnalyzing && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-sm" 
                  onClick={handleAnalyzePDF}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'تحليل المستند' : 'Analyze PDF'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
