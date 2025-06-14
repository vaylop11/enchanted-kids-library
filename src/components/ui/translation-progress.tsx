
import React from 'react';
import { Loader2, Languages, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslationProgressProps {
  isTranslating: boolean;
  translatedText: string;
  targetLanguage: string;
  currentPage: number;
  totalPages?: number;
  isCached?: boolean;
  className?: string;
}

const TranslationProgress: React.FC<TranslationProgressProps> = ({
  isTranslating,
  translatedText,
  targetLanguage,
  currentPage,
  totalPages,
  isCached = false,
  className
}) => {
  const { language } = useLanguage();

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
          <h3 className="text-lg font-semibold">
            {language === 'ar' ? 'جاري الترجمة...' : 'Translating...'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? `ترجمة الصفحة ${currentPage}${totalPages ? ` من ${totalPages}` : ''} إلى ${targetLanguage}`
              : `Translating page ${currentPage}${totalPages ? ` of ${totalPages}` : ''} to ${targetLanguage}`}
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
        "flex items-center gap-2 p-3 rounded-lg border mb-4",
        isCached 
          ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
        className
      )}>
        {isCached ? (
          <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        ) : (
          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
        )}
        <div className="flex-1">
          <span className={cn(
            "text-sm font-medium",
            isCached 
              ? "text-blue-800 dark:text-blue-200"
              : "text-green-800 dark:text-green-200"
          )}>
            {isCached 
              ? (language === 'ar' ? 'ترجمة محفوظة مسبقاً' : 'Cached translation')
              : (language === 'ar' ? 'تمت الترجمة بنجاح' : 'Translation completed')
            }
          </span>
          {totalPages && (
            <div className="text-xs text-muted-foreground mt-1">
              {language === 'ar' 
                ? `الصفحة ${currentPage} من ${totalPages}`
                : `Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>
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
        <p className="text-lg font-medium">
          {language === 'ar' ? 'اختر لغة لبدء الترجمة' : 'Select language to start translation'}
        </p>
        <p className="text-sm">
          {language === 'ar' 
            ? 'سيتم ترجمة محتوى الصفحة الحالية فورًا' 
            : 'Current page content will be translated instantly'}
        </p>
        {totalPages && (
          <p className="text-xs text-muted-foreground">
            {language === 'ar' 
              ? `الصفحة ${currentPage} من ${totalPages}`
              : `Page ${currentPage} of ${totalPages}`}
          </p>
        )}
      </div>
    </div>
  );
};

export default TranslationProgress;
