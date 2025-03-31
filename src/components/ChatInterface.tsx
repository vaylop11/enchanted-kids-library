
import { useRef, useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Trash2, ArrowUp, ArrowDown, Brain, FileText, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ChatMessage as ChatMessageType } from '@/services/pdfStorage';
import ChatMessage from '@/components/ChatMessage';
import PDFAnalysisProgress from '@/components/PDFAnalysisProgress';
import { AnalysisProgress } from '@/services/pdfAnalysisService';
import { ChatMessageSkeleton } from '@/components/ui/skeleton';
import { AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isLoadingMessages: boolean;
  isAnalyzing: boolean;
  isWaitingForResponse: boolean;
  analysisProgress: AnalysisProgress;
  language: string;
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
  onGenerateSummary: () => void;
  onTranslate: () => void;
  onDeleteMessage?: (messageId: string) => void;
  isDeletingMessage?: boolean;
}

const ChatInterface = ({
  messages,
  isLoadingMessages,
  isAnalyzing,
  isWaitingForResponse,
  analysisProgress,
  language,
  onSendMessage,
  onClearMessages,
  onGenerateSummary,
  onTranslate,
  onDeleteMessage,
  isDeletingMessage = false
}: ChatInterfaceProps) => {
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const scrollToLatestMessage = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    scrollToLatestMessage();
  };
  
  useEffect(() => {
    if (messages.length > 0) {
      scrollToLatestMessage();
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    onSendMessage(chatInput.trim());
    setChatInput('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (chatInput.trim()) {
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b bg-muted/30">
        <h2 className="font-medium flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          {language === 'ar' ? 'محادثة حول الملف' : 'Chat with PDF'}
        </h2>
        
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGenerateSummary}
            className="text-xs px-2.5 py-1 h-7 rounded-full"
            disabled={isWaitingForResponse}
          >
            <FileText className="h-3 w-3 mr-1" />
            {language === 'ar' ? 'ملخص' : 'Summary'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onTranslate}
            className="text-xs px-2.5 py-1 h-7 rounded-full"
            disabled={isWaitingForResponse}
          >
            <Languages className="h-3 w-3 mr-1" />
            {language === 'ar' ? 'ترجمة' : 'Translate'}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearMessages}
            className="text-xs text-destructive hover:text-destructive px-2.5 py-1 h-7 rounded-full"
            disabled={!messages.length || isWaitingForResponse}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            {language === 'ar' ? 'مسح' : 'Clear'}
          </Button>
        </div>
      </div>
      
      <div className="relative flex-1">
        <ScrollArea className="h-[400px] px-4 py-3" ref={scrollAreaRef}>
          {isLoadingMessages ? (
            <>
              <ChatMessageSkeleton isUser={false} />
              <div className="h-3"></div>
              <ChatMessageSkeleton isUser={true} />
            </>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 p-4 text-center text-muted-foreground">
              <Brain className="h-8 w-8 mb-3 opacity-50" />
              <p className="text-sm">
                {language === 'ar'
                  ? 'اسأل أي سؤال حول محتوى هذا المستند'
                  : 'Ask any question about the content of this document'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    onDelete={onDeleteMessage}
                    isPermanentlyDeleting={isDeletingMessage}
                  />
                ))}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
          )}
          
          {isAnalyzing && (
            <PDFAnalysisProgress analysis={analysisProgress} />
          )}
        </ScrollArea>
        
        {messages.length > 5 && (
          <div className="absolute right-2 bottom-20 flex flex-col gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollToTop}
              className="h-8 w-8 rounded-full shadow-md"
              title={language === 'ar' ? 'التمرير لأعلى' : 'Scroll to top'}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={scrollToBottom}
              className="h-8 w-8 rounded-full shadow-md"
              title={language === 'ar' ? 'التمرير لأسفل' : 'Scroll to bottom'}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === 'ar' 
              ? 'اكتب سؤالك حول هذا المستند...' 
              : 'Type your question about this document...'}
            className="min-h-10 resize-none rounded-lg"
            disabled={isWaitingForResponse}
          />
          <Button 
            type="submit" 
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0"
            disabled={!chatInput.trim() || isWaitingForResponse}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
