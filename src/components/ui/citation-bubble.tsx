import React from 'react';
import { cn } from '@/lib/utils';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CitationBubbleProps {
  pageNumber?: number;
  snippet?: string;
  onClick?: () => void;
  className?: string;
  language?: 'ar' | 'en';
}

export const CitationBubble: React.FC<CitationBubbleProps> = ({
  pageNumber,
  snippet,
  onClick,
  className,
  language = 'en'
}) => {
  const isRTL = language === 'ar';
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={cn(
              "inline-flex items-center gap-1.5 h-auto px-2 py-1 text-xs",
              "bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
              "border border-blue-200 dark:border-blue-800",
              "text-blue-700 dark:text-blue-300",
              "rounded-md transition-all duration-200",
              "hover:scale-105 hover:shadow-sm",
              isRTL && "flex-row-reverse",
              className
            )}
          >
            <FileText className="w-3 h-3" />
            <span className="font-medium">
              {pageNumber 
                ? (language === 'ar' ? `ص ${pageNumber}` : `Page ${pageNumber}`)
                : (language === 'ar' ? 'مرجع' : 'Source')
              }
            </span>
            {onClick && <ExternalLink className="w-2.5 h-2.5 opacity-60" />}
          </Button>
        </TooltipTrigger>
        {snippet && (
          <TooltipContent 
            side="top" 
            className="max-w-xs p-3"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <p className="text-xs leading-relaxed line-clamp-3">
              {snippet}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};
