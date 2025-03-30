
import { Progress } from "@/components/ui/progress";
import { AnalysisProgress, AnalysisStage } from "@/services/pdfAnalysisService";
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
      case AnalysisStage.Extracting:
        return <FileText className="h-5 w-5 animate-pulse" />;
      case AnalysisStage.Analyzing:
        return <Brain className="h-5 w-5 animate-pulse" />;
      case AnalysisStage.Generating:
        return <Sparkles className="h-5 w-5 animate-pulse" />;
      case AnalysisStage.Complete:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case AnalysisStage.Error:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStageLabel = () => {
    if (language === 'ar') {
      switch (analysis.stage) {
        case AnalysisStage.Extracting: return 'استخراج النص';
        case AnalysisStage.Analyzing: return 'تحليل المحتوى';
        case AnalysisStage.Generating: return 'إنشاء الإجابة';
        case AnalysisStage.Complete: return 'اكتمل';
        case AnalysisStage.Error: return 'خطأ';
        default: return '';
      }
    } else {
      switch (analysis.stage) {
        case AnalysisStage.Extracting: return 'Extracting Text';
        case AnalysisStage.Analyzing: return 'Analyzing Content';
        case AnalysisStage.Generating: return 'Generating Answer';
        case AnalysisStage.Complete: return 'Complete';
        case AnalysisStage.Error: return 'Error';
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
            analysis.stage === AnalysisStage.Error ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
            analysis.stage === AnalysisStage.Complete ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
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
