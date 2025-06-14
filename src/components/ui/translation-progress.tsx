
import React from 'react';
import { Loader2, Languages, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranslationProgressProps {
  isTranslating: boolean;
  translatedText: string;
  targetLanguage: string;
  currentPage: number;
  className?: string;
}

const TranslationProgress: React.FC<TranslationProgressProps> = ({
  isTranslating,
  translatedText,
  targetLanguage,
  currentPage,
  className
}) => {
  if (isTranslating) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center h-full gap-4 p-6",
        className
      )}>
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Languages className="h-6 w-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">جاري الترجمة...</h3>
          <p className="text-sm text-muted-foreground">
            ترجمة الصفحة {currentPage} إلى {targetLanguage}
          </p>
          
          {/* Animated dots */}
          <div className="flex justify-center space-x-1 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full max-w-xs">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (translatedText) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 mb-4",
        className
      )}>
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-sm font-medium text-green-800 dark:text-green-200">
          تمت الترجمة بنجاح
        </span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center h-full text-muted-foreground",
      className
    )}>
      <div className="text-center space-y-3">
        <Languages className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="text-lg font-medium">اختر لغة لبدء الترجمة</p>
        <p className="text-sm">سيتم ترجمة محتوى الصفحة الحالية فورًا</p>
      </div>
    </div>
  );
};

export default TranslationProgress;
