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
  ArrowDown,
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import { ChatMessageSkeleton } from '@/components/ui/skeleton';
import { MarkdownMessage } from '@/components/ui/markdown-message';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

// Enhanced Skeleton Loader with Typing Animation
const MessageSkeleton = ({ language }: { language: 'ar' | 'en' }) => (
  <div className={cn("flex gap-3", language === 'ar' ? 'flex-row-reverse' : '')}>
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
      <Bot className="w-5 h-5 text-white" />
    </div>
    <div className="max-w-[75%] space-y-2">
      <div className="bg-white/80 border border-gray-200/50 dark:bg-gray-800/80 dark:border-gray-700/50 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          </div>
          <span className="text-xs text-muted-foreground">
            {language === 'ar' ? 'يكتب...' : 'Typing...'}
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gradient-to-r from-gray-200 via-white to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer bg-[length:200%_100%]" style={{ width: '85%' }} />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-white to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer bg-[length:200%_100%] [animation-delay:0.5s]" style={{ width: '60%' }} />
          <div className="h-4 bg-gradient-to-r from-gray-200 via-white to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-shimmer bg-[length:200%_100%] [animation-delay:1s]" style={{ width: '90%' }} />
        </div>
      </div>
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
  const { toast } = useToast();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // Detect direction for mixed content
  const detectTextDirection = useCallback((text: string) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
          inline: "nearest"
        });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  // Maintain auto-scroll behavior
  useEffect(() => {
    if (autoScroll && messagesEndRef.current && !isUserScrolling) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  }, [messages, autoScroll, isUserScrolling]);

  // Enhanced scroll detection with user scroll tracking
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    
    setIsUserScrolling(true);
    setAutoScroll(isAtBottom);
    
    // Reset user scrolling flag after scroll ends
    const timer = setTimeout(() => setIsUserScrolling(false), 150);
    return () => clearTimeout(timer);
  }, []);

  // Copy message handler
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: language === 'ar' ? 'تم النسخ' : 'Copied',
      description: language === 'ar' ? 'تم نسخ الرسالة' : 'Message copied to clipboard',
    });
    onCopyMessage?.(content);
  }, [language, toast, onCopyMessage]);

  // Feedback handler
  const handleFeedback = useCallback((messageId: string, feedback: 'positive' | 'negative') => {
    onMessageFeedback?.(messageId, feedback);
    toast({
      title: language === 'ar' ? 'شكرا لك' : 'Thank you',
      description: language === 'ar' 
        ? 'تم تسجيل تقييمك' 
        : 'Your feedback has been recorded',
    });
  }, [language, toast, onMessageFeedback]);

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
                    <div className={cn(
                      "flex gap-3 mb-4", 
                      message.isUser 
                        ? (language === 'ar' ? "flex-row" : "flex-row-reverse") 
                        : (language === 'ar' ? "flex-row-reverse" : "flex-row")
                    )}>
                      {/* Avatar */}
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 transition-transform hover:scale-105",
                        message.isUser 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                          : "bg-gradient-to-br from-blue-500 to-purple-600"
                      )}>
                        {message.isUser ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={cn(
                        "max-w-[75%] space-y-2 flex flex-col", 
                        message.isUser 
                          ? (language === 'ar' ? "items-start" : "items-end")
                          : (language === 'ar' ? "items-end" : "items-start")
                      )}>
                        <div className={cn(
                          "rounded-2xl px-4 py-3 shadow-lg border backdrop-blur-sm transition-all duration-200 hover:shadow-xl",
                          message.isUser 
                            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-200/20" 
                            : "bg-white/80 border-gray-200/50 text-gray-900 dark:bg-gray-800/80 dark:border-gray-700/50 dark:text-gray-100"
                        )} dir={messageDir}>
                          {message.isUser ? (
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </div>
                          ) : (
                            <MarkdownMessage 
                              content={message.content} 
                              className="text-sm leading-relaxed"
                            />
                          )}
                          <StatusIndicator message={message} />
                        </div>

                        {/* Action Buttons for Bot Messages */}
                        {!message.isUser && !isAnalyzing && (
                          <div className={cn(
                            "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                            language === 'ar' ? "flex-row-reverse" : "flex-row"
                          )}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyMessage(message.content)}
                                  className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {language === 'ar' ? 'نسخ' : 'Copy'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRegenerateMessage?.(message.id)}
                                  className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {language === 'ar' ? 'إعادة توليد' : 'Regenerate'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, 'positive')}
                                  className={cn(
                                    "h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 rounded-lg",
                                    message.feedback === 'positive' && "bg-green-50 text-green-600 dark:bg-green-900/20"
                                  )}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {language === 'ar' ? 'إعجاب' : 'Like'}
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, 'negative')}
                                  className={cn(
                                    "h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-lg",
                                    message.feedback === 'negative' && "bg-red-50 text-red-600 dark:bg-red-900/20"
                                  )}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {language === 'ar' ? 'عدم إعجاب' : 'Dislike'}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Enhanced Skeleton for Bot output */}
              {isAnalyzing && (
                <div className="mb-4">
                  <MessageSkeleton language={language} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Enhanced scroll animation with smooth behavior */}
          {!autoScroll && (
            <div className="absolute bottom-4 right-4 z-10">
              <Button
                size="icon"
                onClick={() => {
                  setAutoScroll(true);
                  setIsUserScrolling(false);
                  messagesEndRef.current?.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "end" 
                  });
                }}
                className={cn(
                  "rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl",
                  "animate-bounce"
                )}
              >
                <ArrowDown className="w-4 h-4" />
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
