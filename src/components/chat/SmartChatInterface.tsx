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
  Sparkles,
  Paperclip,
  Mic,
  MoreVertical
} from 'lucide-react';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import { EnhancedMessageCard } from '@/components/ui/enhanced-message-card';
import { SmartSuggestionsPanel } from '@/components/ui/smart-suggestions-panel';
import { ChatMessageSkeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from '@/hooks/use-toast';

// Enhanced Modern Skeleton Loader with Typing Animation
const MessageSkeleton = ({ language }: { language: 'ar' | 'en' }) => (
  <div className={cn("flex gap-3", language === 'ar' ? 'flex-row-reverse' : '')}>
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-pulse flex-shrink-0">
      <Bot className="w-5 h-5 text-white" />
    </div>
    <div className="max-w-[80%] space-y-3">
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/50 to-transparent dark:via-blue-900/20 animate-shimmer bg-[length:200%_100%]" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce"></div>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              {language === 'ar' ? 'يكتب...' : 'AI is thinking...'}
            </span>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-gradient-to-r from-gray-200/80 via-gray-100 to-gray-200/80 dark:from-gray-700/80 dark:via-gray-600 dark:to-gray-700/80 rounded-full animate-pulse" style={{ width: '85%' }} />
            <div className="h-4 bg-gradient-to-r from-gray-200/80 via-gray-100 to-gray-200/80 dark:from-gray-700/80 dark:via-gray-600 dark:to-gray-700/80 rounded-full animate-pulse [animation-delay:0.2s]" style={{ width: '65%' }} />
            <div className="h-4 bg-gradient-to-r from-gray-200/80 via-gray-100 to-gray-200/80 dark:from-gray-700/80 dark:via-gray-600 dark:to-gray-700/80 rounded-full animate-pulse [animation-delay:0.4s]" style={{ width: '90%' }} />
            <div className="h-4 bg-gradient-to-r from-gray-200/80 via-gray-100 to-gray-200/80 dark:from-gray-700/80 dark:via-gray-600 dark:to-gray-700/80 rounded-full animate-pulse [animation-delay:0.6s]" style={{ width: '45%' }} />
          </div>
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
  const [isRecording, setIsRecording] = useState(false);
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
    <>
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 rounded-2xl overflow-hidden shadow-xl border border-gray-200/50 dark:border-gray-700/50",
        "w-full max-w-none",
        className
      )}>
        {/* Header with gradient background */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-white flex items-center gap-2">
                {language === 'ar' ? 'مساعد PDF الذكي' : 'Smart PDF Assistant'}
                <Sparkles className="w-4 h-4 text-yellow-300" />
              </h3>
              {pdfTitle && (
                <p className="text-xs text-white/80 truncate max-w-[200px]" title={pdfTitle}>
                  {pdfTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {messages.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="h-8 w-8 p-0 hover:bg-white/20 text-white"
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
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
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

        {/* Messages Area with enhanced styling */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea 
            className="h-full" 
            onScrollCapture={handleScroll}
            ref={scrollAreaRef}
          >
            <div className="p-4 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {/* Smart Suggestions Panel (only when no messages) */}
              {messages.length === 0 && !isAnalyzing && (
                <SmartSuggestionsPanel
                  suggestions={suggestions}
                  onSuggestionClick={onSendMessage}
                  language={language}
                  className="mb-6"
                />
              )}

              {messages.map((message) => (
                <EnhancedMessageCard
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  language={language}
                  feedback={message.feedback}
                  onCopy={() => handleCopyMessage(message.content)}
                  onRegenerate={() => onRegenerateMessage?.(message.id)}
                  onFeedback={(type) => handleFeedback(message.id, type)}
                  className="mb-4"
                />
              ))}

              {/* Enhanced Skeleton for Bot output */}
              {isAnalyzing && (
                <div className="mb-4">
                  <MessageSkeleton language={language} />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Enhanced scroll to bottom button */}
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
                  "w-12 h-12 rounded-full shadow-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 transition-all duration-300 hover:scale-110 hover:shadow-2xl",
                  "animate-bounce"
                )}
              >
                <ArrowDown className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Input Area with additional features */}
        <div className="flex-shrink-0 border-t bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-3">
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'إرفاق ملف' : 'Attach file'}
              </TooltipContent>
            </Tooltip>
            
            <div className="flex-1">
              <EnhancedChatInput
                onSubmit={onSendMessage}
                placeholder={language === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                suggestions={suggestions}
                isAnalyzing={isAnalyzing}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
                className="border-0 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm"
              />
            </div>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-full",
                    isRecording 
                      ? "text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" 
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  )}
                  onClick={() => setIsRecording(!isRecording)}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'تسجيل صوتي' : 'Voice recording'}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'المزيد من الخيارات' : 'More options'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
    <div className="h-16 sm:h-18 mb-4 sm:mb-6" />
    </>
  );
};

export default SmartChatInterface;
