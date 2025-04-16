
import { Progress } from "@/components/ui/progress";
import { AnalysisProgress } from "@/services/pdfAnalysisService";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Brain, Sparkles, CheckCircle, AlertTriangle, Loader, FileSearch, Dices } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PDFAnalysisProgressProps {
  analysis: AnalysisProgress;
  isLoading?: boolean;
  uploadProgress?: number;
  totalSize?: number;
}

const PDFAnalysisProgress = ({ analysis, isLoading = false, uploadProgress = 0, totalSize = 0 }: PDFAnalysisProgressProps) => {
  const { language } = useLanguage();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="bg-muted/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-8" />
        </div>
        <div className="space-y-3">
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: '60%' }} />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
    );
  }

  const getStageIcon = () => {
    switch (analysis.stage) {
      case 'extracting':
        return <FileText className="h-5 w-5 animate-pulse" />;
      case 'analyzing':
        return <FileSearch className="h-5 w-5 animate-pulse" />;
      case 'generating':
        return <Sparkles className="h-5 w-5 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'waiting':
        return <Dices className="h-5 w-5 animate-spin" />;
      default:
        return <Loader className="h-5 w-5 animate-spin" />;
    }
  };

  const getStageLabel = () => {
    if (language === 'ar') {
      switch (analysis.stage) {
        case 'extracting': return 'استخراج النص';
        case 'analyzing': return 'تحليل المحتوى';
        case 'generating': return 'إنشاء الإجابة';
        case 'complete': return 'اكتمل';
        case 'error': return 'خطأ';
        case 'waiting': return 'لحظة من فضلك';
        default: return '';
      }
    } else {
      switch (analysis.stage) {
        case 'extracting': return 'Extracting Text';
        case 'analyzing': return 'Analyzing Content';
        case 'generating': return 'Generating Answer';
        case 'complete': return 'Complete';
        case 'error': return 'Error';
        case 'waiting': return 'One moment please';
        default: return '';
      }
    }
  };

  const isWaiting = analysis.stage === 'waiting';
  const waitingClass = isWaiting ? "animate-pulse" : "";
  const uploadInProgress = uploadProgress > 0 && uploadProgress < 100;

  return (
    <div className={cn(
      "bg-gradient-to-br from-muted/40 to-muted/20 backdrop-blur-sm rounded-lg p-4 mb-4 border border-border/50",
      isWaiting && "border-primary/30"
    )}>
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium py-1.5",
            analysis.stage === 'error' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
            analysis.stage === 'complete' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
            analysis.stage === 'analyzing' ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
            analysis.stage === 'waiting' ? "bg-blue-100/50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {getStageIcon()}
          <span>{getStageLabel()}</span>
        </Badge>
        <span className="text-xs text-muted-foreground font-medium">
          {uploadInProgress ? `${uploadProgress}%` : `${analysis.progress}%`}
        </span>
      </div>

      <div className="space-y-3">
        {/* Upload Progress */}
        {uploadInProgress && (
          <div className="space-y-1.5">
            <div className="relative w-full h-2 overflow-hidden bg-muted rounded-full">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {language === 'ar' ? 'جارٍ التحميل...' : 'Uploading...'}
              </span>
              <span>
                {formatFileSize(totalSize * (uploadProgress / 100))} / {formatFileSize(totalSize)}
              </span>
            </div>
          </div>
        )}

        {/* Analysis Progress */}
        {!uploadInProgress && (
          <div className="space-y-1.5">
            <div className="relative w-full h-2 overflow-hidden bg-muted rounded-full">
              {isWaiting ? (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="animate-[progress_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent h-full w-1/2" />
                </div>
              ) : (
                <div 
                  className={cn(
                    "h-full transition-all duration-300 ease-out rounded-full",
                    analysis.stage === 'error' ? "bg-red-500" :
                    analysis.stage === 'complete' ? "bg-green-500" : 
                    analysis.stage === 'analyzing' ? "bg-amber-500" : "bg-primary",
                    analysis.stage !== 'complete' && analysis.stage !== 'error' && "animate-pulse"
                  )}
                  style={{ width: `${analysis.progress}%` }}
                />
              )}
            </div>

            <div className={cn("flex items-center text-xs", waitingClass)}>
              <p className="text-muted-foreground">{analysis.message}</p>
              {isWaiting && (
                <div className="ml-auto flex gap-1">
                  <span className="h-1.5 w-1.5 bg-primary rounded-full animate-[bounce_1.1s_infinite]"></span>
                  <span className="h-1.5 w-1.5 bg-primary rounded-full animate-[bounce_1.1s_0.2s_infinite]"></span>
                  <span className="h-1.5 w-1.5 bg-primary rounded-full animate-[bounce_1.1s_0.4s_infinite]"></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFAnalysisProgress;
