import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Languages, 
  Copy, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  Clock,
  FileText,
  Globe,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supportedLanguages } from '@/services/translationService';

interface InteractiveTranslationPanelProps {
  originalText: string;
  translatedText: string;
  isTranslating: boolean;
  targetLanguage: string;
  onLanguageChange: (language: string) => void;
  onRetranslate: () => void;
  onCopyOriginal: () => void;
  onCopyTranslated: () => void;
  onDownload: () => void;
  currentPage?: number;
  totalPages?: number;
  className?: string;
}

const InteractiveTranslationPanel: React.FC<InteractiveTranslationPanelProps> = ({
  originalText,
  translatedText,
  isTranslating,
  targetLanguage,
  onLanguageChange,
  onRetranslate,
  onCopyOriginal,
  onCopyTranslated,
  onDownload,
  currentPage = 1,
  totalPages = 1,
  className
}) => {
  const [activeTab, setActiveTab] = useState<'original' | 'translated'>('translated');
  const [wordCount, setWordCount] = useState({ original: 0, translated: 0 });

  // Calculate word counts
  useEffect(() => {
    const originalWords = originalText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const translatedWords = translatedText.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCount({ original: originalWords, translated: translatedWords });
  }, [originalText, translatedText]);

  const selectedLanguage = supportedLanguages.find(lang => lang.code === targetLanguage);

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-br from-background to-muted/20",
        "border border-border/50 rounded-lg overflow-hidden",
        className
      )}>
        {/* Translation Header */}
        <div className="p-4 bg-card/80 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg">
                <Languages className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">الترجمة التفاعلية</h3>
                <p className="text-xs text-muted-foreground">
                  {currentPage > 1 ? `صفحة ${currentPage} من ${totalPages}` : 'المستند كاملاً'}
                </p>
              </div>
            </div>
            
            {isTranslating && (
              <div className="flex items-center gap-2 text-blue-600">
                <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-xs font-medium">جاري الترجمة...</span>
              </div>
            )}
          </div>
          
          {/* Language Selection */}
          <div className="space-y-3">
            <Select value={targetLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="اختر اللغة المستهدفة">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {selectedLanguage?.name || 'اختر اللغة'}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {lang.code.toUpperCase()}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetranslate}
                disabled={isTranslating || !originalText}
                className="flex-1"
              >
                <RefreshCw className={cn("h-4 w-4 mr-2", isTranslating && "animate-spin")} />
                إعادة ترجمة
              </Button>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    disabled={!translatedText}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تحميل الترجمة</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-muted/30 border-b border-border/50">
          <button
            onClick={() => setActiveTab('original')}
            className={cn(
              "flex-1 p-3 text-sm font-medium transition-all duration-200",
              "border-b-2 border-transparent hover:bg-muted/50",
              activeTab === 'original' 
                ? "border-primary bg-background text-primary" 
                : "text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="h-4 w-4" />
              النص الأصلي
              {wordCount.original > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {wordCount.original} كلمة
                </Badge>
              )}
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('translated')}
            className={cn(
              "flex-1 p-3 text-sm font-medium transition-all duration-200",
              "border-b-2 border-transparent hover:bg-muted/50",
              activeTab === 'translated' 
                ? "border-primary bg-background text-primary" 
                : "text-muted-foreground"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Languages className="h-4 w-4" />
              الترجمة
              {translatedText && (
                <CheckCircle className="h-3 w-3 text-green-600" />
              )}
              {wordCount.translated > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {wordCount.translated} كلمة
                </Badge>
              )}
            </div>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 relative">
          {/* Original Text Tab */}
          {activeTab === 'original' && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-border/30">
                <span className="text-sm text-muted-foreground">النص العربي الأصلي</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopyOriginal}
                  disabled={!originalText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  نسخ
                </Button>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="prose prose-sm max-w-none text-right" dir="rtl">
                  {originalText || (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                      <FileText className="h-8 w-8 mb-2 opacity-50" />
                      <p className="text-sm">لا يوجد نص للعرض</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Translated Text Tab */}
          {activeTab === 'translated' && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-border/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    الترجمة إلى {selectedLanguage?.name || targetLanguage}
                  </span>
                  {translatedText && (
                    <Badge variant="outline" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      مترجم
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCopyTranslated}
                  disabled={!translatedText}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  نسخ
                </Button>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                {isTranslating ? (
                  <div className="flex flex-col items-center justify-center h-32">
                    <div className="relative mb-4">
                      <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                      <Languages className="absolute inset-0 h-8 w-8 text-primary/20" />
                    </div>
                    <p className="text-sm text-muted-foreground">جاري ترجمة النص...</p>
                    <div className="mt-2 w-32 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-blue-500 w-2/3 animate-pulse" />
                    </div>
                  </div>
                ) : translatedText ? (
                  <div className="prose prose-sm max-w-none" dir="ltr">
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {translatedText}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">انتظر الترجمة أو اختر لغة مستهدفة</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Translation Stats */}
        {(originalText || translatedText) && (
          <div className="p-3 bg-muted/20 border-t border-border/30">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div className="text-center">
                <div className="font-medium text-foreground">{wordCount.original}</div>
                <div>كلمة أصلية</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-foreground">{wordCount.translated}</div>
                <div>كلمة مترجمة</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default InteractiveTranslationPanel;