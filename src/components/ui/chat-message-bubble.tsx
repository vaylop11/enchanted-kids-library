
import React from "react";
import { cn } from "@/lib/utils";
import { Copy, MoreHorizontal, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownMessage } from "@/components/ui/markdown-message";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  language: string;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: 'positive' | 'negative') => void;
}

export function ChatMessageBubble({ 
  message, 
  language, 
  onCopy,
  onRegenerate,
  onFeedback 
}: ChatMessageBubbleProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast.success(language === 'ar' ? 'تم نسخ الرسالة' : 'Message copied');
    onCopy?.(message.content);
  };

  const handleRegenerate = () => {
    onRegenerate?.(message.id);
  };

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    onFeedback?.(message.id, feedback);
    toast.success(language === 'ar' ? 'شكرًا لتقييمك' : 'Thank you for your feedback');
  };

  return (
    <div 
      className={cn(
        "flex flex-col p-4 rounded-xl max-w-[85%] group relative shadow-sm",
        message.isUser 
          ? "ml-auto bg-primary text-primary-foreground" 
          : "mr-auto bg-muted border"
      )}
    >
      <MarkdownMessage 
        content={message.content} 
        className={cn(
          "prose-sm max-w-none",
          message.isUser ? "text-primary-foreground prose-invert" : ""
        )}
      />
      
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-current/10">
        <div className="text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>

        <div className={cn(
          "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full"
                  onClick={handleCopy}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'نسخ' : 'Copy'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {!message.isUser && (
            <>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-full"
                      onClick={handleRegenerate}
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {language === 'ar' ? 'إعادة إنشاء' : 'Regenerate'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 rounded-full"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium mb-2">
                      {language === 'ar' ? 'تقييم الإجابة' : 'Rate Response'}
                    </h4>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => handleFeedback('positive')}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {language === 'ar' ? 'مفيد' : 'Helpful'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => handleFeedback('negative')}
                      >
                        <ThumbsDown className="h-3 w-3 mr-1" />
                        {language === 'ar' ? 'غير مفيد' : 'Not helpful'}
                      </Button>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          <span className="font-medium">{language === 'ar' ? 'المعرف:' : 'ID:'}</span>{' '}
                          {message.id.substring(0, 8)}...
                        </div>
                        <div>
                          <span className="font-medium">{language === 'ar' ? 'الوقت:' : 'Time:'}</span>{' '}
                          {new Date(message.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
