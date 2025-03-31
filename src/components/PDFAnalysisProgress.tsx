
import { Progress } from "@/components/ui/progress";
import { AnalysisProgress } from "@/services/pdfAnalysisService";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileText, Brain, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PDFAnalysisProgressProps {
  analysis: AnalysisProgress;
}

const PDFAnalysisProgress = ({ analysis }: PDFAnalysisProgressProps) => {
  const { language } = useLanguage();

  const getStageIcon = () => {
    switch (analysis.stage) {
      case 'extracting':
        return <FileText className="h-5 w-5 animate-pulse" />;
      case 'analyzing':
        return <Brain className="h-5 w-5 animate-pulse" />;
      case 'generating':
        return <Sparkles className="h-5 w-5 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5" />;
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
        default: return '';
      }
    } else {
      switch (analysis.stage) {
        case 'extracting': return 'Extracting Text';
        case 'analyzing': return 'Analyzing Content';
        case 'generating': return 'Generating Answer';
        case 'complete': return 'Complete';
        case 'error': return 'Error';
        default: return '';
      }
    }
  };

  return (
    <div className="bg-muted/30 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <Badge
          variant="outline"
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            analysis.stage === 'error' ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
            analysis.stage === 'complete' ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
            "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
          )}
        >
          {getStageIcon()}
          <span>{getStageLabel()}</span>
        </Badge>
        <span className="text-xs text-muted-foreground">
          {analysis.progress}%
        </span>
      </div>
      <Progress value={analysis.progress} className="h-2 w-full" />
      <p className="text-xs text-muted-foreground mt-2">{analysis.message}</p>
    </div>
  );
};

export default PDFAnalysisProgress;
