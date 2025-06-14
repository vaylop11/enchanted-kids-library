
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Play, Pause, Square } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface BatchTranslationManagerProps {
  totalPages: number;
  currentTargetLanguage: string;
  onTranslateAll: (onProgress: (page: number, total: number) => void) => Promise<void>;
  onDownloadAll: () => void;
  translatedPages: number[];
  className?: string;
}

const BatchTranslationManager: React.FC<BatchTranslationManagerProps> = ({
  totalPages,
  currentTargetLanguage,
  onTranslateAll,
  onDownloadAll,
  translatedPages,
  className
}) => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const progress = totalPages > 0 ? (translatedPages.length / totalPages) * 100 : 0;

  const handleStartTranslation = async () => {
    if (!currentTargetLanguage) {
      toast.error(language === 'ar' ? 'يرجى اختيار لغة الترجمة أولاً' : 'Please select target language first');
      return;
    }

    setIsTranslating(true);
    setIsPaused(false);

    try {
      await onTranslateAll((page: number, total: number) => {
        setCurrentPage(page);
        if (page === total) {
          setIsTranslating(false);
          toast.success(language === 'ar' ? 'تمت ترجمة جميع الصفحات بنجاح' : 'All pages translated successfully');
        }
      });
    } catch (error) {
      setIsTranslating(false);
      toast.error(language === 'ar' ? 'فشل في ترجمة الصفحات' : 'Failed to translate pages');
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    setIsTranslating(false);
    setIsPaused(false);
    setCurrentPage(0);
  };

  const handleDownloadAll = () => {
    if (translatedPages.length === 0) {
      toast.error(language === 'ar' ? 'لا توجد ترجمات للتحميل' : 'No translations to download');
      return;
    }
    onDownloadAll();
  };

  return (
    <div className={`bg-card rounded-lg border p-4 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">
          {language === 'ar' ? 'ترجمة جميع الصفحات' : 'Translate All Pages'}
        </h3>
        <div className="text-xs text-muted-foreground">
          {translatedPages.length} / {totalPages} {language === 'ar' ? 'صفحة' : 'pages'}
        </div>
      </div>

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground text-center">
          {isTranslating
            ? `${language === 'ar' ? 'جاري ترجمة الصفحة' : 'Translating page'} ${currentPage}...`
            : `${Math.round(progress)}% ${language === 'ar' ? 'مكتمل' : 'complete'}`}
        </div>
      </div>

      <div className="flex gap-2">
        {!isTranslating ? (
          <Button
            onClick={handleStartTranslation}
            size="sm"
            className="flex-1"
            disabled={!currentTargetLanguage}
          >
            <Play className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'بدء الترجمة' : 'Start Translation'}
          </Button>
        ) : (
          <>
            <Button
              onClick={handlePauseResume}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'استكمال' : 'Resume'}
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إيقاف مؤقت' : 'Pause'}
                </>
              )}
            </Button>
            <Button
              onClick={handleStop}
              size="sm"
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'إيقاف' : 'Stop'}
            </Button>
          </>
        )}
      </div>

      <Button
        onClick={handleDownloadAll}
        size="sm"
        variant="outline"
        className="w-full"
        disabled={translatedPages.length === 0}
      >
        <Download className="h-4 w-4 mr-2" />
        {language === 'ar' ? 'تحميل جميع الترجمات' : 'Download All Translations'}
      </Button>
    </div>
  );
};

export default BatchTranslationManager;
