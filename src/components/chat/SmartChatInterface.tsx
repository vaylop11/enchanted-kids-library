import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
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
  Send,
  Bot,
  User,
  Plus
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
  metadata?: {
    pageReference?: number;
    translationTarget?: string;
    analysisType?: string;
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
  suggestions = [],
  className,
  pdfTitle
}) => {
  const isMobile = useIsMobile();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Improved auto-scroll with better timing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [messages.length, isAnalyzing]);

  // Quick actions - simplified
  const quickActions = [
    {
      id: 'summarize',
      icon: FileText,
      label: 'تلخيص',
      action: () => onSendMessage('لخص النقاط الرئيسية في هذا المستند')
    },
    {
      id: 'translate',
      icon: Languages,
      label: 'ترجمة',
      action: () => onTranslateRequest('en')
    },
    {
      id: 'analyze',
      icon: Search,
      label: 'تحليل',
      action: () => onSendMessage('حلل محتوى هذا المستند')
    },
    {
      id: 'explain',
      icon: Sparkles,
      label: 'شرح مبسط',
      action: () => onSendMessage('اشرح المفاهيم المعقدة بطريقة مبسطة')
    }
  ];

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-background border border-border rounded-lg overflow-hidden",
        className
      )}>
        {/* Simplified Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-card/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm">مساعد PDF</h3>
              {pdfTitle && (
                <p className="text-xs text-muted-foreground truncate max-w-48">
                  {pdfTitle}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickActions(!showQuickActions)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetChat}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Quick Actions - Collapsible */}
        {(messages.length === 0 || showQuickActions) && (
          <div className="flex-shrink-0 p-3 border-b bg-muted/30">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="h-8 text-xs"
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages - Fixed Layout */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
            <div className="p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">ابدأ محادثتك</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    اطرح أي سؤال حول المستند أو استخدم الإجراءات السريعة
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 group",
                      message.isUser && "flex-row-reverse"
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {message.isUser ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className={cn(
                      "flex-1 min-w-0",
                      message.isUser && "text-right"
                    )}>
                      <div className={cn(
                        "inline-block max-w-[85%] p-3 rounded-lg text-sm leading-relaxed",
                        message.isUser 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted border"
                      )}>
                        {message.content}
                      </div>

                      {/* Message Actions - Only for bot messages */}
                      {!message.isUser && (
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyMessage(message.content)}
                            className="h-7 px-2 text-xs"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            نسخ
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRegenerateMessage(message.id)}
                            className="h-7 px-2 text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            إعادة
                          </Button>
                          <div className="flex">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMessageFeedback(message.id, 'positive')}
                              className={cn(
                                "h-7 w-7 p-0",
                                message.feedback === 'positive' && "text-green-600"
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
                                message.feedback === 'negative' && "text-red-600"
                              )}
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {message.metadata && (
                        <div className="flex gap-2 mt-2">
                          {message.metadata.pageReference && (
                            <Badge variant="outline" className="text-xs">
                              صفحة {message.metadata.pageReference}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Typing Indicator */}
              {isAnalyzing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 bg-muted border rounded-lg p-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">يكتب...</span>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={chatEndRef} className="h-1" />
            </div>
          </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t">
          <EnhancedChatInput
            onSubmit={onSendMessage}
            placeholder="اكتب سؤالك هنا..."
            suggestions={suggestions}
            isAnalyzing={isAnalyzing}
            dir="rtl"
            className="border-0 bg-transparent"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SmartChatInterface;
