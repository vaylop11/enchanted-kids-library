import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  RotateCcw,
  Bot,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowDown
} from 'lucide-react';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Skeleton Loader
const MessageSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <div className="w-8 h-8 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full" />
    <div className="flex flex-col gap-2 max-w-[70%]">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
    </div>
  </div>
);

export interface SmartChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  isAnalyzing?: boolean;
  progress?: number;
  status?: 'sending' | 'processing' | 'completed' | 'error';
  metadata?: {
    pageReference?: number;
    translationTarget?: string;
    analysisType?: string;
    language?: 'en' | 'ar';
  };
}

interface SmartChatInterfaceProps {
  messages: SmartChatMessage[];
  onSendMessage: (message: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onCopyMessage: (content: string) => void;
  onMessageFeedback: (messageId: string, feedback: 'positive' | 'negative') => void;
  onResetChat: () => void;
  onTranslateRequest: (targetLanguage: string) => void;
  isAnalyzing?: boolean;
  analysisProgress?: number;
  suggestions?: string[];
  className?: string;
  pdfTitle?: string;
}

const SmartChatInterface: React.FC<SmartChatInterfaceProps> = ({
  messages,
  onSendMessage,
  onRegenerateMessage,
  onCopyMessage,
  onMessageFeedback,
  onResetChat,
  onTranslateRequest,
  isAnalyzing = false,
  analysisProgress = 0,
  suggestions = [],
  className,
  pdfTitle
}) => {
  const isMobile = useIsMobile();
  const { language } = useLanguage();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Detect direction for mixed content
  const detectTextDirection = useCallback((text: string) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end"
      });
    }
  }, [messages, autoScroll]);

  // Detect if user scrolled up manually
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 80;
    setAutoScroll(isAtBottom);
  }, []);

  // Status indicator
  const StatusIndicator = ({ message }: { message: SmartChatMessage }) => {
    if (message.isUser) return null;

    const status = message.status || 'completed';
    const progress = message.progress || 0;

    switch (status) {
      case 'sending':
        return (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            <span className="text-xs text-muted-foreground">
              {language === 'ar' ? 'يرسل...' : 'Sending...'}
            </span>
          </div>
        );
      case 'processing':
        return (
          <div className="flex items-center gap-2 mt-2">
            <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
            <Progress value={progress} className="flex-1 h-1" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 mt-2">
            <XCircle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-600">
              {language === 'ar' ? 'فشل في المعالجة' : 'Processing failed'}
            </span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-1 mt-2 opacity-60">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm",
        "dark:bg-gray-900 dark:border-gray-800",
        className
      )}>
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b bg-gray-50/80 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {language === 'ar' ? 'مساعد PDF الذكي' : 'Smart PDF Assistant'}
              </h3>
              {pdfTitle && (
                <p className="text-xs text-gray-500 truncate max-w-48" title={pdfTitle}>
                  {pdfTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Plus className={cn("w-4 h-4 transition-transform", showQuickActions && "rotate-45")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {language === 'ar' ? 'إجراءات سريعة' : 'Quick actions'}
                </TooltipContent>
              </Tooltip>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetChat}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'مسح المحادثة' : 'Clear chat'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea 
            className="h-full" 
            onScrollCapture={handleScroll}
            ref={scrollAreaRef}
          >
            <div className="p-4 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {messages.map((message) => {
                const messageDir = message.metadata?.language 
                  ? (message.metadata.language === 'ar' ? 'rtl' : 'ltr')
                  : detectTextDirection(message.content);

                return (
                  <div key={message.id} className="group">
                    <div className={cn("flex gap-3", message.isUser ? "justify-end" : "justify-start")}>
                      {!message.isUser && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className={cn("max-w-[80%] space-y-2", message.isUser ? "items-end" : "items-start")}>
                        <div className={cn(
                          "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                          message.isUser 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                            : "bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                        )} dir={messageDir}>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <StatusIndicator message={message} />
                        </div>
                      </div>
                      {message.isUser && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-gray-700">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Skeleton for Bot output */}
              {isAnalyzing && <MessageSkeleton />}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          {!autoScroll && (
            <div className="absolute bottom-4 right-4">
              <Button
                size="icon"
                onClick={() => {
                  setAutoScroll(true);
                  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                <ArrowDown className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t bg-gray-50/50 dark:bg-gray-800/30">
          <EnhancedChatInput
            onSubmit={onSendMessage}
            placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
            suggestions={suggestions}
            isAnalyzing={isAnalyzing}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            className="border-0 bg-transparent"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SmartChatInterface;
