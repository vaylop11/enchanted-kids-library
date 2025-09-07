import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
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
  const [quickActionMode, setQuickActionMode] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        "flex flex-col h-full bg-gradient-to-br from-background via-background/95 to-muted/30",
        "border border-border/50 rounded-lg overflow-hidden",
        className
      )}>
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-sm">مساعد PDF الذكي</h3>
              <p className="text-xs text-muted-foreground">
                {pdfTitle ? `يحلل: ${pdfTitle.substring(0, 30)}...` : 'جاهز للمساعدة'}
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
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>مسح المحادثة</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Quick Actions */}
        {messages.length === 0 && (
          <div className="p-4 border-b border-border/50 bg-muted/20">
            <p className="text-sm text-muted-foreground mb-3">إجراءات سريعة:</p>
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className={cn(
                    "justify-start gap-2 h-auto p-3 text-xs font-medium",
                    "border-dashed hover:border-solid transition-all duration-200",
                    action.color
                  )}
                >
                  <action.icon className="h-3 w-3" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="relative mb-4">
                  <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full">
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 bg-background rounded-full border border-border">
                    <Sparkles className="h-3 w-3 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2">ابدأ محادثة مع مستندك</h3>
                <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
                  اطرح أي سؤال حول المستند، أو استخدم الإجراءات السريعة أعلاه للبدء
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.isUser ? "justify-end" : "justify-start"
                  )}
                >
                  {!message.isUser && (
                    <div className="flex-shrink-0">
                      <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div className={cn(
                    "max-w-[80%] space-y-2",
                    message.isUser ? "items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "rounded-2xl p-4 shadow-sm border transition-all duration-200 hover:shadow-md",
                      message.isUser 
                        ? "bg-primary text-primary-foreground ml-auto" 
                        : "bg-card/80 backdrop-blur-sm"
                    )}>
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </div>
                      
                      {!message.isUser && (
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCopyMessage(message.content)}
                              className="h-6 px-2 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              نسخ
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRegenerateMessage(message.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              إعادة توليد
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-1">
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
                      <div className="p-2 bg-gradient-to-br from-muted to-muted/50 rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Analysis indicator */}
            {isAnalyzing && (
              <div className="flex gap-3 animate-fade-in">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border">
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
                    <span className="text-sm text-muted-foreground">يحلل المحتوى...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        </ScrollArea>

        {/* Enhanced Input */}
        <div className="border-t border-border/50">
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