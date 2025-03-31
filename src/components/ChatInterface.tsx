
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, XCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PDFChatMessage, formatMessageTimestamp, getMessageId } from '@/types/chat';

interface ChatInterfaceProps {
  messages: PDFChatMessage[];
  isLoadingMessages: boolean;
  isWaitingForResponse: boolean;
  language: string;
  onSendMessage: (content: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  isDeletingMessage?: boolean;
}

const ChatInterface = ({
  messages,
  isLoadingMessages,
  isWaitingForResponse,
  language,
  onSendMessage,
  onDeleteMessage,
  isDeletingMessage
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (inputValue.trim() && !isWaitingForResponse) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="p-3 border-b bg-muted/20 flex justify-between items-center">
        <h2 className="font-semibold">
          {language === 'ar' ? 'دردشة مع المستند' : 'Chat with Document'}
        </h2>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center p-4">
              <div className="h-5 w-5 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              {language === 'ar' 
                ? 'اطرح سؤالاً حول المستند' 
                : 'Ask a question about the document'}
            </div>
          ) : (
            messages.map((message) => {
              const id = getMessageId(message);
              
              return (
                <div
                  key={id}
                  className={`group flex flex-col p-3 rounded-lg max-w-[80%] relative ${
                    message.isUser 
                      ? 'ml-auto bg-primary text-primary-foreground' 
                      : 'mr-auto bg-muted'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs opacity-70">
                      {message.isUser 
                        ? language === 'ar' ? 'أنت' : 'You' 
                        : 'AI'}
                    </span>
                  </div>
                  
                  {onDeleteMessage && message.isUser && (
                    <button
                      onClick={() => onDeleteMessage(id)}
                      disabled={isDeletingMessage}
                      className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-background rounded-full p-1 hover:bg-muted transition-opacity"
                      aria-label={language === 'ar' ? 'حذف الرسالة' : 'Delete message'}
                    >
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          
          {isWaitingForResponse && (
            <div className="flex flex-col space-y-3 mr-auto max-w-[80%] bg-muted p-3 rounded-lg">
              <div className="h-2 w-32 bg-muted-foreground/30 rounded animate-pulse"></div>
              <div className="h-2 w-24 bg-muted-foreground/30 rounded animate-pulse"></div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-3 border-t flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={language === 'ar' 
            ? 'اطرح سؤالاً حول المستند...' 
            : 'Ask a question about the document...'}
          className="min-h-9 resize-none flex-1"
          disabled={isWaitingForResponse}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isWaitingForResponse}
          className="h-9 w-9 rounded-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
