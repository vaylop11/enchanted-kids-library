import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  FileText, 
  Search, 
  BookOpen, 
  MessageSquare,
  Lightbulb,
  ListChecks,
  Languages
} from 'lucide-react';

interface SmartSuggestion {
  id: string;
  text: string;
  icon: React.ElementType;
  category: 'summarize' | 'analyze' | 'explain' | 'question' | 'translate' | 'extract';
  color: string;
}

interface SmartSuggestionsPanelProps {
  suggestions?: string[];
  onSuggestionClick: (suggestion: string) => void;
  language?: 'ar' | 'en';
  className?: string;
  documentType?: 'general' | 'academic' | 'technical' | 'legal';
}

export const SmartSuggestionsPanel: React.FC<SmartSuggestionsPanelProps> = ({
  suggestions = [],
  onSuggestionClick,
  language = 'en',
  className,
  documentType = 'general'
}) => {
  const isRTL = language === 'ar';

  // Generate smart suggestions based on document type
  const getDefaultSuggestions = (): SmartSuggestion[] => {
    const baseTranslations = {
      summarize: language === 'ar' ? 'لخص النقاط الرئيسية' : 'Summarize key points',
      analyze: language === 'ar' ? 'حلل المحتوى بعمق' : 'Analyze content deeply',
      explain: language === 'ar' ? 'اشرح المفاهيم المعقدة' : 'Explain complex concepts',
      questions: language === 'ar' ? 'اقترح أسئلة مهمة' : 'Suggest important questions',
      translate: language === 'ar' ? 'ترجم أجزاء محددة' : 'Translate specific sections',
      extract: language === 'ar' ? 'استخرج المعلومات الرئيسية' : 'Extract key information'
    };

    const baseSuggestions: SmartSuggestion[] = [
      {
        id: 'summarize',
        text: suggestions[0] || baseTranslations.summarize,
        icon: FileText,
        category: 'summarize',
        color: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200/50'
      },
      {
        id: 'analyze',
        text: suggestions[1] || baseTranslations.analyze,
        icon: Search,
        category: 'analyze',
        color: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-200/50'
      },
      {
        id: 'explain',
        text: suggestions[2] || baseTranslations.explain,
        icon: BookOpen,
        category: 'explain',
        color: 'bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200/50'
      },
      {
        id: 'questions',
        text: suggestions[3] || baseTranslations.questions,
        icon: MessageSquare,
        category: 'question',
        color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-200/50'
      }
    ];

    // Add document-specific suggestions
    if (documentType === 'academic') {
      baseSuggestions.push({
        id: 'extract-findings',
        text: language === 'ar' ? 'استخرج النتائج الرئيسية' : 'Extract key findings',
        icon: ListChecks,
        category: 'extract',
        color: 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 border-indigo-200/50'
      });
    }

    if (documentType === 'technical') {
      baseSuggestions.push({
        id: 'explain-technical',
        text: language === 'ar' ? 'اشرح المصطلحات التقنية' : 'Explain technical terms',
        icon: Lightbulb,
        category: 'explain',
        color: 'bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 border-cyan-200/50'
      });
    }

    return baseSuggestions.slice(0, 6); // Max 6 suggestions
  };

  const smartSuggestions = getDefaultSuggestions();

  if (smartSuggestions.length === 0) return null;

  return (
    <Card className={cn(
      "p-4 border-dashed border-2 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm",
      className
    )}>
      <div className={cn(
        "flex items-center gap-2 mb-3",
        isRTL && "flex-row-reverse"
      )}>
        <Sparkles className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">
          {language === 'ar' ? 'اقتراحات ذكية' : 'Smart Suggestions'}
        </h4>
      </div>

      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-2",
        isRTL && "text-right"
      )}>
        {smartSuggestions.map((suggestion) => {
          const Icon = suggestion.icon;
          return (
            <Button
              key={suggestion.id}
              variant="outline"
              onClick={() => onSuggestionClick(suggestion.text)}
              className={cn(
                "h-auto py-3 px-3 justify-start text-left transition-all duration-200",
                "hover:scale-105 hover:shadow-md",
                "border",
                suggestion.color,
                isRTL && "justify-end text-right flex-row-reverse"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isRTL ? "ml-2" : "mr-2")} />
              <span className="text-xs font-medium line-clamp-2">
                {suggestion.text}
              </span>
            </Button>
          );
        })}
      </div>

      <p className={cn(
        "text-xs text-muted-foreground mt-3",
        isRTL && "text-right"
      )}>
        {language === 'ar' 
          ? 'انقر على أي اقتراح للبدء بالمحادثة' 
          : 'Click any suggestion to start a conversation'}
      </p>
    </Card>
  );
};
