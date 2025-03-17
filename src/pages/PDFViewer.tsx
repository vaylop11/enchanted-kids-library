import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getPDFById, 
  addChatMessageToPDF, 
  getChatMessagesForPDF, 
  SupabasePDF, 
  uploadPDFToSupabase 
} from '@/services/pdfSupabaseService';
import { 
  getSavedPDFs, 
  savePDF, 
  getPDFById as getLocalPDFById, 
  UploadedPDF, 
  addChatMessageToPDF as addLocalChatMessageToPDF 
} from '@/services/pdfStorage';
import { formatFileSize } from '@/services/pdfStorage';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, FileDown, ArrowLeft, Save } from "lucide-react"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const isUploadedPDF = (pdf: SupabasePDF | UploadedPDF): pdf is UploadedPDF => {
  return 'dataUrl' in pdf;
};

const PDFViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user } = useAuth();

  const [pdfData, setPdfData] = useState<SupabasePDF | UploadedPDF | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isTemporaryFile, setIsTemporaryFile] = useState(false);

  useEffect(() => {
    const loadPDF = async () => {
      setIsLoading(true);
      try {
        if (id?.startsWith('temp-')) {
          setIsTemporaryFile(true);
          const tempPdfData = sessionStorage.getItem('tempPdfFile');
          if (tempPdfData) {
            const { fileData } = JSON.parse(tempPdfData);
            setPdfData(fileData);
            setChatMessages(fileData.chatMessages || []);
          } else {
            toast.error(language === 'ar' ? 'الملف المؤقت غير موجود' : 'Temporary file not found');
            navigate('/');
            return;
          }
        } else {
          setIsTemporaryFile(false);
          let pdf;
          if (user) {
            pdf = await getPDFById(id!);
          } else {
            pdf = getLocalPDFById(id!);
          }
          if (pdf) {
            setPdfData(pdf);
          } else {
            toast.error(language === 'ar' ? 'الملف غير موجود' : 'File not found');
            navigate('/pdfs');
            return;
          }
        }
        
        if (!isTemporaryFile && id) {
          const loadedMessages = await getChatMessagesForPDF(id);
          setChatMessages(loadedMessages);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        toast.error(language === 'ar' ? 'فشل في تحميل الملف' : 'Failed to load file');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [id, navigate, language, user]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const onDocumentLoadSuccess = ({ numPages: nextNumPages }: { numPages: number }) => {
    setNumPages(nextNumPages);
    if (pdfData) {
      if (user) {
      } else {
        if (isUploadedPDF(pdfData)) {
          savePDF({
            ...pdfData,
            pageCount: nextNumPages
          });
        }
      }
    }
  };

  const changePage = (amount: number) => {
    if (numPages) {
      setPageNumber((prevPageNumber) => Math.max(1, Math.min(prevPageNumber + amount, numPages)));
    }
  };

  const goToPrevPage = () => changePage(-1);
  const goToNextPage = () => changePage(1);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (isTemporaryFile) {
      const newMessage = addLocalChatMessageToPDF(id || '', {
        content: message,
        isUser: true,
        timestamp: new Date()
      });

      if (newMessage) {
        setChatMessages(prevMessages => [...prevMessages, newMessage]);
        setMessage('');

        const tempPdfData = sessionStorage.getItem('tempPdfFile');
        if (tempPdfData) {
          const { fileData } = JSON.parse(tempPdfData);
          const updatedFileData = {
            ...fileData,
            chatMessages: [...(fileData.chatMessages || []), newMessage]
          };
          sessionStorage.setItem('tempPdfFile', JSON.stringify({
            fileData: updatedFileData,
            timestamp: Date.now()
          }));
        }
      } else {
        toast.error(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      }
    } else {
      const newMessage = await addChatMessageToPDF(id || '', message, true);
      if (newMessage) {
        setChatMessages(prevMessages => [...prevMessages, newMessage]);
        setMessage('');
      } else {
        toast.error(language === 'ar' ? 'فشل في إرسال الرسالة' : 'Failed to send message');
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleGoBack = () => {
    navigate('/pdfs');
  };

  const handleDownload = () => {
    if (pdfData) {
      if (isUploadedPDF(pdfData)) {
        const link = document.createElement('a');
        link.href = pdfData.dataUrl;
        link.download = pdfData.title || 'document.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if ('fileUrl' in pdfData) {
        window.open(pdfData.fileUrl, '_blank');
      }
    } else {
      toast.error(language === 'ar' ? 'لا يمكن تنزيل الملف' : 'Cannot download file');
    }
  };

  const handleSaveToPermanent = async () => {
    if (!user) {
      navigate('/signin');
      return;
    }

    if (!isTemporaryFile || !pdfData) return;

    setIsSaving(true);
    
    try {
      if (isUploadedPDF(pdfData)) {
        const dataUrlParts = pdfData.dataUrl.split(',');
        const mimeString = dataUrlParts[0].split(':')[1].split(';')[0];
        const byteString = atob(dataUrlParts[1]);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const intArray = new Uint8Array(arrayBuffer);
        
        for (let i = 0; i < byteString.length; i++) {
          intArray[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([arrayBuffer], { type: mimeString });
        const file = new File([blob], pdfData.title, { type: mimeString });
        
        const pdf = await uploadPDFToSupabase(file, user.id);
        
        if (pdf) {
          if (pdfData.chatMessages && pdfData.chatMessages.length > 0) {
            for (const message of pdfData.chatMessages) {
              await addChatMessageToPDF(pdf.id, message.content, message.isUser);
            }
          }
          
          sessionStorage.removeItem('tempPdfFile');
          
          toast.success(language === 'ar' ? 'تم حفظ الملف بنجاح' : 'File saved successfully');
          
          navigate(`/pdf/${pdf.id}`);
        } else {
          throw new Error('Failed to save PDF');
        }
      }
    } catch (error) {
      console.error('Error saving PDF:', error);
      toast.error(language === 'ar' ? 'حدث خطأ أثناء حفظ الملف' : 'Error occurred while saving the file');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-16 w-16 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!pdfData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">{language === 'ar' ? 'الملف غير موجود' : 'File not found'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-background border-b border-border/40 py-4">
        <div className="container mx-auto px-4 md:px-6 flex items-center">
          <Button variant="ghost" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
          <h1 className="text-lg font-semibold">{pdfData.title}</h1>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <FileDown className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تنزيل' : 'Download'}
            </Button>
            {isTemporaryFile && user && (
              <Button
                onClick={handleSaveToPermanent}
                className="ml-auto"
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-2" />
                ) : null}
                {language === 'ar' ? 'حفظ في ملفاتي' : 'Save to My PDFs'}
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-grow flex flex-col md:flex-row container mx-auto px-4 md:px-6 py-6">
        <div className="md:w-3/5 flex flex-col items-center border-r border-border/40 md:pr-6">
          <div className="w-full max-w-3xl">
            <Document
              file={isUploadedPDF(pdfData) ? pdfData.dataUrl : (pdfData as SupabasePDF).fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="w-full"
            >
              <Page pageNumber={pageNumber} width={700} />
            </Document>
          </div>

          <div className="flex justify-center space-x-4 mt-4 w-full max-w-3xl">
            <Button
              variant="outline"
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
            >
              {language === 'ar' ? 'السابق' : 'Previous'}
            </Button>
            <span className="text-sm text-muted-foreground">
              {pageNumber ? `Page ${pageNumber} of ${numPages}` : null}
            </span>
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
            >
              {language === 'ar' ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>

        <div className="md:w-2/5 flex flex-col md:pl-6">
          <h2 className="heading-3 mb-4">{language === 'ar' ? 'الدردشة' : 'Chat'}</h2>
          <div className="flex-grow overflow-y-auto mb-4" ref={chatContainerRef}>
            <ScrollArea className="h-[500px] rounded-md border border-border/40 p-4">
              <div className="flex flex-col space-y-2">
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col ${msg.isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`rounded-lg px-3 py-2 text-sm ${msg.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex items-center">
            <Input
              type="text"
              placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-grow mr-2"
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إرسال' : 'Send'}
            </Button>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="text-sm">
            {language === 'ar'
              ? `© ${new Date().getFullYear()} أداة دردشة PDF. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} PDF Chat Tool. All rights reserved.`
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PDFViewer;
