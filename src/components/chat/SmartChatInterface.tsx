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
  Trash2,
  Send,
  Bot,
  User
} from 'lucide-react';
import { EnhancedChatInput } from '@/components/ui/enhanced-chat-input';
import { ChatMessageBubble } from '@/components/ui/chat-message-bubble';
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
  const [quickActionMode, setQuickActionMode] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Quick action buttons for common tasks
  const quickActions = [
    {
      id: 'summarize',
      icon: FileText,
      label: 'لخص المستند',
      color: 'bg-blue-500/10 text-blue-600 border-blue-200',
      action: () => onSendMessage('قم بتلخيص النقاط الرئيسية في هذا المستند')
    },
    {
      id: 'translate',
      icon: Languages,
      label: 'ترجم إلى الإنجليزية',
      color: 'bg-green-500/10 text-green-600 border-green-200',
      action: () => onTranslateRequest('en')
    },
    {
      id: 'analyze',
      icon: Search,
      label: 'حلل المحتوى',
      color: 'bg-purple-500/10 text-purple-600 border-purple-200',
      action: () => onSendMessage('حلل محتوى هذا المستند واشرح النقاط المهمة')
    },
    {
      id: 'explain',
      icon: Sparkles,
      label: 'اشرح بالتفصيل',
      color: 'bg-orange-500/10 text-orange-600 border-orange-200',
      action: () => onSendMessage('اشرح المفاهيم المعقدة في هذا المستند بطريقة مبسطة')
    }
  ];

  const enhancedSuggestions = [
    'ما هو الموضوع الرئيسي لهذا المستند؟',
    'لخص النقاط المهمة في نقاط',
    'ما هي الاستنتاجات الرئيسية؟',
    'اشرح الأقسام المعقدة',
    'ترجم هذا النص إلى الإنجليزية',
    'ما هي التوصيات المقترحة؟',
    ...suggestions
  ];

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full max-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30",
        "border border-border/50 rounded-lg overflow-hidden",
        className
      )}>
        {/* Chat Header - Mobile Optimized */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-between bg-card/80 backdrop-blur-sm border-b border-border/50",
          isMobile ? "p-3" : "p-4"
        )}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={cn(
                "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center",
                isMobile ? "p-1.5" : "p-2"
              )}>
                <Bot className={cn("text-primary", isMobile ? "h-4 w-4" : "h-5 w-5")} />
              </div>
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className={cn("font-semibold", isMobile ? "text-xs" : "text-sm")}>مساعد PDF الذكي</h3>
              <p className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-xs")}>
                {pdfTitle 
                  ? (isMobile 
                      ? `${pdfTitle.substring(0, 20)}...` 
                      : `يحلل: ${pdfTitle.substring(0, 30)}...`)
                  : 'جاهز للمساعدة'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onResetChat}
                  className={cn(
                    "text-muted-foreground hover:text-destructive",
                    isMobile ? "h-8 w-8" : "h-8 w-8"
                  )}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>مسح المحادثة</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        {messages.length === 0 && (
          <div className={cn(
            "flex-shrink-0 border-b border-border/50 bg-muted/20",
            isMobile ? "p-3" : "p-4"
          )}>
            <p className={cn("text-muted-foreground mb-3", isMobile ? "text-xs" : "text-sm")}>
              إجراءات سريعة:
            </p>
            <div className={cn(
              "grid gap-2",
              isMobile ? "grid-cols-1" : "grid-cols-2"
            )}>
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size={isMobile ? "sm" : "sm"}
                  onClick={action.action}
                  className={cn(
                    "justify-start gap-2 font-medium",
                    "border-dashed hover:border-solid transition-all duration-200",
                    action.color,
                    isMobile 
                      ? "h-10 p-3 text-xs" 
                      : "h-auto p-3 text-xs"
                  )}
                >
                  <action.icon className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area - Fixed Scrolling */}
        <div className="flex-1 min-h-0 relative">
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full w-full"
          >
            <div className={cn("h-full", isMobile ? "p-3" : "p-4")}>
              <div className={cn("space-y-3 min-h-full", isMobile && "space-y-2")}>
                {messages.length === 0 ? (
                  <div className={cn(
                    "flex flex-col items-center justify-center h-full text-center min-h-[300px]",
                    isMobile ? "py-8" : "py-12"
                  )}>
                    <div className="relative mb-4">
                      <div className={cn(
                        "bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center",
                        isMobile ? "p-3" : "p-4"
                      )}>
                        <MessageSquare className={cn("text-primary", isMobile ? "h-6 w-6" : "h-8 w-8")} />
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-border">
                        <Sparkles className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                    <h3 className={cn("font-semibold mb-2", isMobile ? "text-base" : "text-lg")}>
                      ابدأ محادثة مع مستندك
                    </h3>
                    <p className={cn(
                      "text-muted-foreground max-w-md leading-relaxed",
                      isMobile ? "text-xs px-4" : "text-sm"
                    )}>
                      اطرح أي سؤال حول المستند، أو استخدم الإجراءات السريعة أعلاه للبدء
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex animate-fade-in",
                          message.isUser ? "justify-end" : "justify-start",
                          isMobile ? "gap-2" : "gap-3"
                        )}
                      >
                        {!message.isUser && (
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center",
                              isMobile ? "p-1.5" : "p-2"
                            )}>
                              <Bot className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            </div>
                          </div>
                        )}
                        
                        <div className={cn(
                          "space-y-2",
                          message.isUser ? "items-end" : "items-start",
                          isMobile ? "max-w-[85%]" : "max-w-[80%]"
                        )}>
                          <div className={cn(
                            "rounded-2xl shadow-sm border transition-all duration-200 hover:shadow-md",
                            message.isUser 
                              ? "bg-primary text-primary-foreground ml-auto" 
                              : "bg-card/80 backdrop-blur-sm",
                            isMobile ? "p-3" : "p-4"
                          )}>
                            <div className={cn(
                              "whitespace-pre-wrap leading-relaxed",
                              isMobile ? "text-sm" : ""
                            )}>
                              {message.content}
                            </div>
                            
                            {!message.isUser && (
                              <div className={cn(
                                "flex items-center justify-between border-t border-border/30",
                                isMobile ? "mt-2 pt-2" : "mt-3 pt-3",
                                isMobile ? "flex-col gap-2" : "flex-row"
                              )}>
                                <div className={cn(
                                  "flex items-center gap-1",
                                  isMobile && "w-full justify-center"
                                )}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onCopyMessage(message.content)}
                                    className={cn("text-xs", isMobile ? "h-5 px-1.5" : "h-6 px-2")}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    نسخ
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRegenerateMessage(message.id)}
                                    className={cn("text-xs", isMobile ? "h-5 px-1.5" : "h-6 px-2")}
                                  >
                                    <RefreshCw className="h-3 w-3 mr-1" />
                                    إعادة توليد
                                  </Button>
                                </div>
                                
                                <div className={cn(
                                  "flex items-center gap-1",
                                  isMobile && "w-full justify-center"
                                )}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onMessageFeedback(message.id, 'positive')}
                                    className={cn(
                                      "h-6 w-6",
                                      message.feedback === 'positive' && "text-green-600"
                                    )}
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onMessageFeedback(message.id, 'negative')}
                                    className={cn(
                                      "h-6 w-6",
                                      message.feedback === 'negative' && "text-red-600"
                                    )}
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Message metadata */}
                          {message.metadata && (
                            <div className="flex gap-2">
                              {message.metadata.pageReference && (
                                <Badge variant="secondary" className="text-xs">
                                  صفحة {message.metadata.pageReference}
                                </Badge>
                              )}
                              {message.metadata.translationTarget && (
                                <Badge variant="outline" className="text-xs">
                                  ترجمة إلى {message.metadata.translationTarget}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {message.isUser && (
                          <div className="flex-shrink-0">
                            <div className={cn(
                              "bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center",
                              isMobile ? "p-1.5" : "p-2"
                            )}>
                              <User className={cn("text-muted-foreground", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* Analysis indicator */}
                    {isAnalyzing && (
                      <div className={cn(
                        "flex animate-fade-in",
                        isMobile ? "gap-2" : "gap-3"
                      )}>
                        <div className={cn(
                          "bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center",
                          isMobile ? "p-1.5" : "p-2"
                        )}>
                          <Bot className={cn("text-primary", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                        </div>
                        <div className={cn(
                          "bg-card/80 backdrop-blur-sm rounded-2xl shadow-sm border",
                          isMobile ? "p-3" : "p-4"
                        )}>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                  style={{ animationDelay: `${i * 0.2}s` }}
                                />
                              ))}
                            </div>
                            <span className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
                              يحلل المحتوى...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <div ref={chatEndRef} />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Enhanced Input */}
        <div className="flex-shrink-0 border-t border-border/50">
          <EnhancedChatInput
            onSubmit={onSendMessage}
            placeholder="اكتب سؤالك حول المستند..."
            suggestions={enhancedSuggestions}
            isAnalyzing={isAnalyzing}
            dir="rtl"
            className="border-0"
          />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default SmartChatInterface;
