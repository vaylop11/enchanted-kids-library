import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  Sparkles, 
  RefreshCw, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  Languages,
  FileText,
  Search,
  RotateCcw,
  Bot,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface SmartChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  feedback?: 'positive' | 'negative';
  isAnalyzing?: boolean;
  progress?: number; // 0-100 for progress indication
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

  // Detect text direction based on content
  const detectTextDirection = useCallback((text: string) => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
    return arabicRegex.test(text) ? 'rtl' : 'ltr';
  }, []);

  // Enhanced auto-scroll with user control
  const scrollToBottom = useCallback((force = false) => {
    if ((autoScroll || force) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  }, [autoScroll]);

  // Scroll to bottom when messages change
  useEffect(() => {
    const timer = setTimeout(() => scrollToBottom(), 150);
    return () => clearTimeout(timer);
  }, [messages.length, scrollToBottom]);

  // Detect if user scrolled up manually
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isNearBottom);
  }, []);

  // Quick actions with language support
  const quickActions = [
    {
      id: 'summarize',
      icon: FileText,
      label: language === 'ar' ? 'تلخيص' : 'Summarize',
      action: () => onSendMessage(language === 'ar' ? 'لخص النقاط الرئيسية في هذا المستند' : 'Summarize the main points in this document')
    },
    {
      id: 'translate',
      icon: Languages,
      label: language === 'ar' ? 'ترجمة' : 'Translate',
      action: () => onTranslateRequest(language === 'ar' ? 'en' : 'ar')
    },
    {
      id: 'analyze',
      icon: Search,
      label: language === 'ar' ? 'تحليل' : 'Analyze',
      action: () => onSendMessage(language === 'ar' ? 'حلل محتوى هذا المستند' : 'Analyze the content of this document')
    },
    {
      id: 'explain',
      icon: Sparkles,
      label: language === 'ar' ? 'شرح مبسط' : 'Explain',
      action: () => onSendMessage(language === 'ar' ? 'اشرح المفاهيم المعقدة بطريقة مبسطة' : 'Explain complex concepts in simple terms')
    }
  ];

  // Status indicator component
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
            <div className="flex items-center gap-2 flex-1">
              <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
              <Progress value={progress} className="flex-1 h-1" />
              <span className="text-xs text-muted-foreground">{progress}%</span>
            </div>
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
        {/* Clean Header */}
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

        {/* Quick Actions Bar */}
        {(messages.length === 0 || showQuickActions) && (
          <div className="flex-shrink-0 p-3 border-b bg-gray-50/50 dark:bg-gray-800/30">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="h-8 px-3 text-xs font-medium border-dashed hover:border-solid hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                >
                  <action.icon className="w-3 h-3 mr-1.5" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Global Progress Indicator */}
        {isAnalyzing && analysisProgress > 0 && (
          <div className="flex-shrink-0 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b">
            <div className="flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <div className="flex-1">
                <Progress value={analysisProgress} className="h-2" />
              </div>
              <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                {analysisProgress}%
              </span>
            </div>
          </div>
        )}

        {/* Messages Area with Fixed Scrolling */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea 
            className="h-full" 
            onScrollCapture={handleScroll}
            ref={scrollAreaRef}
          >
            <div className="p-4 space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm dark:from-blue-900/30 dark:to-purple-900/30">
                    <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-gray-100">
                    {language === 'ar' ? 'ابدأ محادثتك مع المستند' : 'Start chatting with your document'}
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md leading-relaxed">
                    {language === 'ar' 
                      ? 'اطرح أي سؤال حول المستند أو استخدم الإجراءات السريعة للبدء'
                      : 'Ask any question about your document or use quick actions to get started'
                    }
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const messageDir = message.metadata?.language 
                    ? (message.metadata.language === 'ar' ? 'rtl' : 'ltr')
                    : detectTextDirection(message.content);
                  
                  return (
                    <div key={message.id} className="group">
                      <div className={cn(
                        "flex gap-3",
                        message.isUser ? "justify-end" : "justify-start"
                      )}>
                        {/* Avatar */}
                        {!message.isUser && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={cn(
                          "max-w-[80%] space-y-2",
                          message.isUser ? "items-end" : "items-start"
                        )}>
                          <div className={cn(
                            "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                            message.isUser 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                              : "bg-white border border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                          )} dir={messageDir}>
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                            
                            <StatusIndicator message={message} />
                          </div>

                          {/* Message Actions */}
                          {!message.isUser && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onCopyMessage(message.content)}
                                className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <Copy className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'نسخ' : 'Copy'}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRegenerateMessage(message.id)}
                                className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                {language === 'ar' ? 'إعادة' : 'Retry'}
                              </Button>
                              <div className="flex ml-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onMessageFeedback(message.id, 'positive')}
                                  className={cn(
                                    "h-7 w-7 p-0",
                                    message.feedback === 'positive' 
                                      ? "text-green-600 bg-green-50 dark:bg-green-900/20" 
                                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                  )}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onMessageFeedback(message.id, 'negative')}
                                  className={cn(
                                    "h-7 w-7 p-0",
                                    message.feedback === 'negative' 
                                      ? "text-red-600 bg-red-50 dark:bg-red-900/20" 
                                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                                  )}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Metadata */}
                          {message.metadata && (
                            <div className="flex gap-2 flex-wrap">
                              {message.metadata.pageReference && (
                                <Badge variant="secondary" className="text-xs">
                                  {language === 'ar' ? `صفحة ${message.metadata.pageReference}` : `Page ${message.metadata.pageReference}`}
                                </Badge>
                              )}
                              {message.metadata.translationTarget && (
                                <Badge variant="outline" className="text-xs">
                                  {language === 'ar' 
                                    ? `ترجمة إلى ${message.metadata.translationTarget}`
                                    : `Translated to ${message.metadata.translationTarget}`
                                  }
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        {message.isUser && (
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-gray-700">
                            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Enhanced Typing Indicator */}
              {isAnalyzing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {language === 'ar' ? 'يحلل المحتوى...' : 'Analyzing content...'}
                      </span>
                      {analysisProgress > 0 && (
                        <span className="text-xs font-medium text-blue-600">
                          {analysisProgress}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          </ScrollArea>
          
          {/* Scroll to bottom button */}
          {!autoScroll && (
            <div className="absolute bottom-4 right-4">
              <Button
                size="sm"
                onClick={() => scrollToBottom(true)}
                className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                ↓
              </Button>
            </div>
          )}
        </div>

        {/* Enhanced Input Area */}
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
