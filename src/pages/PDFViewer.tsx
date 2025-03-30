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
  const { user } = useAuth();
  const { currentLanguage, translations } = useLanguage();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<UploadedPDF | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({
    stage: AnalysisStage.NotStarted,
    progress: 0,
    error: null,
  });
  const [showAllPages, setShowAllPages] = useState<boolean>(true);
  const [chatExpanded, setChatExpanded] = useState<boolean>(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isPdfLoaded, setIsPdfLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      getPDFById(id)
        .then((pdf) => {
          setPdf(pdf);
          setNumPages(pdf.pages);
          setIsPdfLoaded(true);
        })
        .catch((error) => {
          console.error("Error fetching PDF:", error);
          toast.error("Failed to load PDF");
        });
    }
  }, [id]);

  const handleDeleteChat = async () => {
    if (!id) return;
    
    try {
      if (user) {
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
                {pdf?.name || 'Loading PDF...'}
              </h1>
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-1" />
                <span>
                  {numPages 
                    ? `${numPages} ${translations.pages[currentLanguage]}` 
                    : translations.loading[currentLanguage]}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" onClick={() => setShowAllPages(!showAllPages)}>
              {showAllPages 
                ? translations.singlePage[currentLanguage] 
                : translations.allPages[currentLanguage]}
            </Button>
            
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <DownloadCloud className="h-4 w-4 mr-1" />
              {translations.download[currentLanguage]}
            </Button>
            
            {user && (
              <Button variant="outline" size="sm" onClick={() => {/* Share functionality */}}>
                <Share className="h-4 w-4 mr-1" />
                {translations.share[currentLanguage]}
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
                    file={pdf.url}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<Skeleton className="h-[500px] w-full rounded-md" />}
                    error={
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-xl font-semibold">
                          {translations.errorLoadingPDF[currentLanguage]}
                        </h3>
                        <p className="text-gray-500 mt-2">
                          {translations.tryAgain[currentLanguage]}
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
                              {translations.previous[currentLanguage]}
                            </Button>
                            
                            <span className="mx-4">
                              {currentPage} / {numPages}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(Math.min(currentPage + 1, numPages))}
                              disabled={currentPage >= numPages}
                            >
                              {translations.next[currentLanguage]}
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
                  {translations.exploreDocument[currentLanguage]}
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
                  title={translations.deleteChat[currentLanguage]}
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
                <PDFAnalysisProgress progress={analysisProgress} />
              ) : (
                <ScrollArea 
                  className="h-[calc(100vh-360px)]" 
                  ref={chatContainerRef}
                >
                  <div className="flex flex-col p-4 space-y-4">
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500">
                        <FileText className="h-12 w-12 mb-4 opacity-20" />
                        <p>{translations.askAboutDocument[currentLanguage]}</p>
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
                  placeholder={translations.askQuestion[currentLanguage]}
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
              
              {pdf && !pdf.analyzed && !isAnalyzing && (
                <Button 
                  variant="outline" 
                  className="w-full mt-2 text-sm" 
                  onClick={handleAnalyzePDF}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {translations.analyzePDF[currentLanguage]}
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
