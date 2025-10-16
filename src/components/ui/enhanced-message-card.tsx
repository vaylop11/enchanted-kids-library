import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  Share2,
  BookmarkPlus,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { MarkdownMessage } from './markdown-message';
import { CitationBubble } from './citation-bubble';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Citation {
  pageNumber: number;
  snippet: string;
}

interface EnhancedMessageCardProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
  language?: 'ar' | 'en';
  citations?: Citation[];
  feedback?: 'positive' | 'negative';
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (type: 'positive' | 'negative') => void;
  onShare?: () => void;
  onSave?: () => void;
  onCitationClick?: (pageNumber: number) => void;
  className?: string;
}

export const EnhancedMessageCard: React.FC<EnhancedMessageCardProps> = ({
  content,
  isUser,
  timestamp,
  language = 'en',
  citations = [],
  feedback,
  onCopy,
  onRegenerate,
  onFeedback,
  onShare,
  onSave,
  onCitationClick,
  className
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const isRTL = language === 'ar';

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  const isLongContent = content.length > 500;

  return (
    <TooltipProvider>
      <div className={cn(
        "group relative",
        className
      )}>
        {/* Message Content */}
        <div className={cn(
          "rounded-2xl px-4 py-3 shadow-md border backdrop-blur-sm transition-all duration-200 hover:shadow-xl",
          isUser 
            ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-200/20" 
            : "bg-white/80 border-gray-200/60 text-gray-900 dark:bg-gray-800/80 dark:border-gray-700/60 dark:text-gray-100",
          !isExpanded && "max-h-32 overflow-hidden"
        )} dir={isRTL ? 'rtl' : 'ltr'}>
          
          {/* Collapse/Expand for long content */}
          {isLongContent && !isUser && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "absolute top-2 z-10 h-6 px-2 text-xs",
                isRTL ? "left-2" : "right-2"
              )}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" />
                  {language === 'ar' ? 'طي' : 'Collapse'}
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" />
                  {language === 'ar' ? 'توسيع' : 'Expand'}
                </>
              )}
            </Button>
          )}

          {/* Message Text */}
          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          ) : (
            <MarkdownMessage 
              content={content} 
              language={language}
              className="text-sm leading-relaxed"
            />
          )}

          {/* Citations */}
          {!isUser && citations.length > 0 && (
            <div className={cn(
              "flex flex-wrap gap-2 mt-4 pt-3 border-t border-border/50",
              isRTL && "flex-row-reverse"
            )}>
              <span className="text-xs text-muted-foreground font-medium">
                {language === 'ar' ? 'المراجع:' : 'Sources:'}
              </span>
              {citations.map((citation, idx) => (
                <CitationBubble
                  key={idx}
                  pageNumber={citation.pageNumber}
                  snippet={citation.snippet}
                  onClick={() => onCitationClick?.(citation.pageNumber)}
                  language={language}
                />
              ))}
            </div>
          )}

          {/* Timestamp */}
          <div className={cn(
            "text-xs opacity-60 mt-2",
            isRTL ? "text-right" : "text-left"
          )}>
            {timestamp.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>

        {/* Action Buttons (only for AI messages) */}
        {!isUser && (
          <div className={cn(
            "flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200",
            isRTL ? "flex-row-reverse" : "flex-row"
          )}>
            {/* Copy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 w-7 p-0 hover:bg-primary/10"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'نسخ' : 'Copy'}
              </TooltipContent>
            </Tooltip>

            {/* Regenerate */}
            {onRegenerate && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onRegenerate}
                    className="h-7 w-7 p-0 hover:bg-primary/10"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {language === 'ar' ? 'إعادة توليد' : 'Regenerate'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Thumbs Up */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback?.('positive')}
                  className={cn(
                    "h-7 w-7 p-0 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20",
                    feedback === 'positive' && "bg-green-50 text-green-600 dark:bg-green-900/20"
                  )}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'مفيد' : 'Helpful'}
              </TooltipContent>
            </Tooltip>

            {/* Thumbs Down */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeedback?.('negative')}
                  className={cn(
                    "h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20",
                    feedback === 'negative' && "bg-red-50 text-red-600 dark:bg-red-900/20"
                  )}
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {language === 'ar' ? 'غير مفيد' : 'Not helpful'}
              </TooltipContent>
            </Tooltip>

            {/* Share */}
            {onShare && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onShare}
                    className="h-7 w-7 p-0 hover:bg-primary/10"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {language === 'ar' ? 'مشاركة' : 'Share'}
                </TooltipContent>
              </Tooltip>
            )}

            {/* Save */}
            {onSave && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onSave}
                    className="h-7 w-7 p-0 hover:bg-primary/10"
                  >
                    <BookmarkPlus className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {language === 'ar' ? 'حفظ' : 'Save'}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
