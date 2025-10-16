import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Brain, Sparkles, FileSearch, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type AnalysisStage = 'extracting' | 'analyzing' | 'generating' | 'complete' | 'error' | 'waiting';

interface ThinkingIndicatorProps {
  stage: AnalysisStage;
  progress: number;
  message: string;
  className?: string;
  language?: 'ar' | 'en';
}

const stageConfig = {
  waiting: {
    icon: Loader2,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    labelAr: 'جاري التحضير',
    labelEn: 'Preparing'
  },
  extracting: {
    icon: FileSearch,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    labelAr: 'استخراج النص',
    labelEn: 'Extracting'
  },
  analyzing: {
    icon: Brain,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    labelAr: 'يحلل المحتوى',
    labelEn: 'Analyzing'
  },
  generating: {
    icon: Sparkles,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    labelAr: 'يولّد الإجابة',
    labelEn: 'Generating'
  },
  complete: {
    icon: Sparkles,
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    labelAr: 'اكتمل',
    labelEn: 'Complete'
  },
  error: {
    icon: Loader2,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    labelAr: 'خطأ',
    labelEn: 'Error'
  }
};

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  stage,
  progress,
  message,
  className,
  language = 'en'
}) => {
  const [dots, setDots] = useState('');
  const config = stageConfig[stage];
  const Icon = config.icon;
  const isRTL = language === 'ar';
  
  // Animated dots effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "flex flex-col gap-3 p-4 rounded-xl border",
      "backdrop-blur-sm transition-all duration-300",
      config.bgColor,
      "border-gray-200/50 dark:border-gray-700/50",
      className
    )} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with icon and stage label */}
      <div className={cn(
        "flex items-center gap-3",
        isRTL && "flex-row-reverse"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center",
          config.bgColor,
          "border border-current/20"
        )}>
          <Icon className={cn("w-5 h-5", config.color, "animate-pulse")} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            "flex items-center gap-2",
            isRTL && "flex-row-reverse"
          )}>
            <span className={cn("text-sm font-semibold", config.color)}>
              {language === 'ar' ? config.labelAr : config.labelEn}
            </span>
            <span className={cn("text-xs text-muted-foreground", isRTL && "text-right")}>
              {dots}
            </span>
          </div>
          
          <p className={cn(
            "text-xs text-muted-foreground mt-0.5 truncate",
            isRTL && "text-right"
          )}>
            {message}
          </p>
        </div>
        
        {/* Progress percentage */}
        <div className={cn(
          "text-sm font-bold tabular-nums",
          config.color
        )}>
          {progress}%
        </div>
      </div>
      
      {/* Progress bar */}
      <Progress 
        value={progress} 
        className="h-1.5"
      />
      
      {/* Stage indicators */}
      <div className={cn(
        "flex items-center gap-1 justify-center",
        isRTL && "flex-row-reverse"
      )}>
        {(['extracting', 'analyzing', 'generating'] as AnalysisStage[]).map((s, idx) => {
          const stages: AnalysisStage[] = ['extracting', 'analyzing', 'generating'];
          const currentIdx = stages.indexOf(stage);
          const stageIdx = stages.indexOf(s);
          
          return (
            <div
              key={s}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                currentIdx >= stageIdx
                  ? "bg-gradient-to-r from-blue-500 to-purple-500"
                  : "bg-gray-200 dark:bg-gray-700"
              )}
            />
          );
        })}
      </div>
    </div>
  );
};
