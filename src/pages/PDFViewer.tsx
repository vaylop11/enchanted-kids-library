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
import { detectLanguage } from '@/services/translationService';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';

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

const PDFViewer = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [pdf, setPdf] = useState<UploadedPDF | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress>({ stage: 'waiting', progress: 0, message: 'Waiting...' });
  const [pdfText, setPdfText] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [pdfTitle, setPdfTitle] = useState<string>('');
  const [isEditTitleModalOpen, setIsEditTitleModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isSharePopoverOpen, setIsSharePopoverOpen] = useState(false);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isProcessingChat, setIsProcessingChat] = useState(false);
  const [isInitialAnalysisComplete, setIsInitialAnalysisComplete] = useState(false);
  const [isTextExtractionSkipped, setIsTextExtractionSkipped] = useState(false);
  const [isMountedAfterInitialAnalysis, setIsMountedAfterInitialAnalysis] = useState(false);
  const [isMountedRef] = useState(useRef(false));
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchPDF = async () => {
      if (!id) {
        toast.error('PDF ID is missing.');
        return;
      }

      try {
        const fetchedPdf = await getSupabasePDFById(id);

        if (!fetchedPdf) {
          toast.error('PDF not found.');
          navigate('/404');
          return;
        }

        setPdf(fetchedPdf);
        setPdfTitle(fetchedPdf.title || '');
        setNewTitle(fetchedPdf.title || '');

        if (user) {
          setIsOwner(user.id === fetchedPdf.user_id);
        }

        // Fetch chat messages
        try {
          const initialMessages = await getChatMessagesForPDF(id);
          setChatMessages(initialMessages);
        } catch (error) {
          console.error("Error fetching chat messages:", error);
          toast.error("Failed to load chat messages.");
        }

        // If text already exists, skip extraction
        if (fetchedPdf.text) {
          setPdfText(fetchedPdf.text);
          setIsTextExtractionSkipped(true);
          setIsInitialAnalysisComplete(true);
          setIsFetchingInitialData(false);
          return;
        }

        // Start analysis if text is not available
        if (!fetchedPdf.text) {
          await startAnalysis(fetchedPdf.url, fetchedPdf.id);
        }
      } catch (error) {
        console.error('Error fetching PDF:', error);
        toast.error('Failed to load PDF.');
        navigate('/404');
      } finally {
        setIsFetchingInitialData(false);
      }
    };

    fetchPDF();
  }, [id, navigate, user]);

  useEffect(() => {
    if (isInitialAnalysisComplete && isMountedRef.current) {
      setIsMountedAfterInitialAnalysis(true);
    }
  }, [isInitialAnalysisComplete]);

  useEffect(() => {
    supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = supabase.channel('online-users').presenceState();
        const users: OnlineUser[] = [];
        for (const key in presenceState) {
          if (Object.hasOwnProperty.call(presenceState, key)) {
            const element = presenceState[key];
            element.forEach((user: any) => {
              users.push({
                id: user.user_id,
                email: user.user_email,
                online_at: user.online_at
              });
            });
          }
        }
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          setOnlineUsers(prevUsers => [...prevUsers, {
            id: presence.user_id,
            email: presence.user_email,
            online_at: presence.online_at
          }]);
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          setOnlineUsers(prevUsers => prevUsers.filter(u => u.id !== presence.user_id));
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await supabase.presence.track({
            user_id: user?.id,
            user_email: user?.email,
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel('online-users');
    };
  }, [user]);

  const startAnalysis = async (pdfUrl: string, pdfId: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress({ stage: 'extracting', progress: 5, message: 'Extracting text from PDF...' });

    try {
      const extractedText = await extractTextFromPDF(pdfUrl, pdfId, (progress) => {
        setAnalysisProgress(progress);
      });

      setPdfText(extractedText);
      setAnalysisProgress({ stage: 'analyzing', progress: 30, message: 'Analyzing PDF content...' });

      const detectedLang = await detectLanguage(extractedText);
      setDetectedLanguage(detectedLang);

      // Save the extracted text to the database
      try {
        await updatePDFMetadata(pdfId, { text: extractedText });
        toast.success('PDF text saved successfully!');
      } catch (error) {
        console.error('Error saving PDF text:', error);
        toast.error('Failed to save PDF text.');
      }

      setIsInitialAnalysisComplete(true);
    } catch (error: any) {
      console.error('Error during PDF analysis:', error);
      toast.error(`Failed to analyze PDF: ${error.message}`);
      setAnalysisProgress({ stage: 'error', progress: 0, message: 'Analysis failed.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => Math.max(1, Math.min(prevPageNumber + offset, numPages || 1)));
  };

  const goToPrevPage = () => changePage(-1);

  const goToNextPage = () => changePage(1);

  const handleSendChatMessage = async (messageContent: string) => {
    if (!user || !pdf?.id) {
      toast.error("You must be logged in to send messages.");
      return;
    }

    if (isProcessingChat) {
      toast.error("Please wait, processing previous message.");
      return;
    }

    setIsProcessingChat(true);

    try {
      const newMessage: ChatMessage = {
        id: new Date().getTime().toString(),
        content: messageContent,
        user_id: user.id,
        user_email: user.email || 'Unknown',
        created_at: new Date().toISOString(),
        pdf_id: pdf.id
      };

      setChatMessages(prevMessages => [...prevMessages, newMessage]);

      // Optimistically update the UI
      setChatMessages(prevMessages => [...prevMessages, {
        id: 'temp_' + new Date().getTime().toString(),
        content: '...',
        user_id: 'ai',
        user_email: 'AI',
        created_at: new Date().toISOString(),
        pdf_id: pdf.id
      }]);

      const aiResponse = await analyzePDFWithGemini(
        pdfText,
        messageContent,
        (progress) => {
          setAnalysisProgress(progress);
        },
        [...chatMessages, newMessage],
        detectedLanguage
      );

      // Remove the loading message
      setChatMessages(prevMessages => prevMessages.filter(message => !message.id?.startsWith('temp_')));

      const aiMessage: ChatMessage = {
        id: new Date().getTime().toString(),
        content: aiResponse,
        user_id: 'ai',
        user_email: 'AI',
        created_at: new Date().toISOString(),
        pdf_id: pdf.id
      };

      setChatMessages(prevMessages => [...prevMessages, aiMessage]);

      try {
        await addSupabaseChatMessage(pdf.id, newMessage.content, aiResponse);
      } catch (error) {
        console.error("Error adding chat message to Supabase:", error);
        toast.error("Failed to save chat message.");
      }
    } catch (error: any) {
      console.error("Error sending chat message:", error);
      toast.error(`Failed to send chat message: ${error.message}`);
    } finally {
      setIsProcessingChat(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const handleEditTitle = () => {
    setIsEditTitleModalOpen(true);
  };

  const handleSaveTitle = async () => {
    if (!pdf?.id) {
      toast.error("PDF ID is missing.");
      return;
    }

    try {
      await updatePDFMetadata(pdf.id, { title: newTitle });
      setPdfTitle(newTitle);
      toast.success("Title updated successfully!");
    } catch (error) {
      console.error("Error updating title:", error);
      toast.error("Failed to update title.");
    } finally {
      setIsEditTitleModalOpen(false);
    }
  };

  const handleDeletePDF = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeletePDF = async () => {
    if (!pdf?.id) {
      toast.error("PDF ID is missing.");
      return;
    }

    try {
      await deleteSupabasePDF(pdf.id);
      toast.success("PDF deleted successfully!");
      navigate('/pdfs');
    } catch (error) {
      console.error("Error deleting PDF:", error);
      toast.error("Failed to delete PDF.");
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleScaleUp = () => {
    setScale(prevScale => Math.min(prevScale + 0.25, 3));
  };

  const handleScaleDown = () => {
    setScale(prevScale => Math.max(prevScale - 0.25, 0.5));
  };

  const handleRotateRight = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  const handleRotateLeft = () => {
    setRotation(prevRotation => (prevRotation - 90 + 360) % 360);
  };

  const handleShareClick = () => {
    setIsSharePopoverOpen(true);
  };

  const handleCopyLink = () => {
    if (pdf?.id) {
      const pdfLink = `${window.location.origin}/pdf/${pdf.id}`;
      navigator.clipboard.writeText(pdfLink);
      toast.success("Link copied to clipboard!");
    }
  };

  const toggleChatVisibility = () => {
    setIsChatVisible(!isChatVisible);
  };

  if (!isMounted) {
    return <div className="h-screen w-screen flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={pdfTitle || "PDF Viewer"} />
      <Navbar />
      <div className="container mx-auto py-8">
        {isFetchingInitialData ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-muted-foreground">Loading PDF...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* PDF Viewer Section */}
            <div className="md:col-span-2">
              <Card className="mb-4">
                <div className="flex justify-between items-center p-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{pdfTitle || "Untitled PDF"}</h2>
                    {pdf?.created_at && (
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date(pdf.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleScaleDown}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zoom Out</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <span className="text-sm">{Math.round(scale * 100)}%</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleScaleUp}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Zoom In</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleRotateLeft}>
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rotate Left</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={handleRotateRight}>
                            <RotateCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rotate Right</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {isOwner && (
                      <>
                        <Button variant="ghost" size="icon" onClick={handleEditTitle}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleDeletePDF}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleShareClick}>
                          <Share className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="flex flex-col space-y-2">
                          <p className="text-sm font-medium">Share PDF</p>
                          <Button variant="outline" size="sm" onClick={handleCopyLink}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="p-4 flex flex-col items-center">
                  <div ref={pdfContainerRef} style={{ transform: `rotate(${rotation}deg)` }}>
                    <Document
                      file={pdf?.url}
                      onLoadSuccess={onDocumentLoadSuccess}
                      className="w-full"
                    >
                      <Page pageNumber={pageNumber} scale={scale} />
                    </Document>
                  </div>
                  <div className="flex justify-center items-center mt-4 space-x-4">
                    <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pageNumber} of {numPages || 1}
                    </span>
                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= (numPages || 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </Card>
              {isAnalyzing && (
                <PDFAnalysisProgress progress={analysisProgress} />
              )}
              {!isAnalyzing && !isTextExtractionSkipped && isInitialAnalysisComplete && (
                <Badge variant="outline">Analysis Complete</Badge>
              )}
            </div>

            {/* Chat Section */}
            <div className="md:col-span-1 flex flex-col">
              <Card className="flex-grow flex flex-col">
                <div className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Chat</h3>
                    <Button variant="ghost" size="icon" onClick={toggleChatVisibility}>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    {onlineUsers.map((user) => (
                      <TooltipProvider key={user.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{user.email}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    <Badge variant="secondary">{onlineUsers.length} Online</Badge>
                  </div>
                </div>
                {isChatVisible && (
                  <div className="flex-grow flex flex-col">
                    <ScrollArea className="flex-grow p-4">
                      <div className="flex flex-col space-y-4">
                        {chatMessages.length === 0 && !isProcessingChat && (
                          <p className="text-muted-foreground text-center">No messages yet. Be the first to send one!</p>
                        )}
                        {chatMessages.map((message) => (
                          <div key={message.id} className={cn(
                            "flex flex-col space-y-2",
                            message.user_id === user?.id ? "items-end" : "items-start"
                          )}>
                            <div className={cn(
                              "rounded-lg p-3 relative overflow-hidden",
                              message.user_id === user?.id ? "bg-primary text-primary-foreground" : "bg-muted",
                              message.user_id === 'ai' ? 'bg-green-100 dark:bg-green-800 text-black dark:text-white' : ''
                            )}>
                              {message.user_id === 'ai' && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-200/20 to-transparent animate-[shimmer_2s_infinite] dark:via-green-900/10" />
                              )}
                              <MarkdownMessage content={message.content} />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {message.user_id === user?.id ? 'You' : message.user_email} - {new Date(message.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                        {isProcessingChat && (
                          <ChatMessageSkeleton />
                        )}
                      </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                      <ChatInput
                        onSubmit={handleSendChatMessage}
                        disabled={isAnalyzing || !isInitialAnalysisComplete}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Edit Title Modal */}
      {isEditTitleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Title</h2>
            <Input
              type="text"
              value={newTitle}
              onChange={handleTitleChange}
              placeholder="Enter new title"
              className="mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setIsEditTitleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTitle}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Delete PDF</h2>
            <p className="mb-4">Are you sure you want to delete this PDF? This action cannot be undone.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeletePDF}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
