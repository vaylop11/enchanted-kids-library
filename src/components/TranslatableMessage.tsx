import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type TranslateableMessageProps = {
  content: string;
  timestamp: string | Date;
  isUser: boolean;
};

const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
];

const TranslatableMessage: React.FC<TranslateableMessageProps> = ({ content, timestamp, isUser }) => {
  const { language: currentLanguage } = useLanguage();
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatingTo, setTranslatingTo] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async (targetLang: string) => {
    setIsTranslating(true);
    setTranslatingTo(targetLang);

    // Simple mock translation for demo purposes
    // In a real app, you would use a translation API
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTranslations: Record<string, string> = {
        'ar': 'هذا نص مترجم للغة العربية',
        'fr': 'Ceci est le texte traduit en français',
        'es': 'Este es el texto traducido al español',
        'de': 'Dies ist der ins Deutsche übersetzte Text',
        'zh': '这是翻译成中文的文本',
        'en': 'This is the text translated to English',
      };
      
      if (targetLang === currentLanguage) {
        // If translating to current language, just use original content
        setTranslatedContent(null);
      } else {
        // Otherwise use our mock translation or fall back to a message
        setTranslatedContent(mockTranslations[targetLang] || `Translated to ${targetLang}: ${content.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const resetTranslation = () => {
    setTranslatedContent(null);
    setTranslatingTo(null);
  };

  const formattedTime = typeof timestamp === 'string' 
    ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div 
      className={`flex flex-col p-3 rounded-lg max-w-[80%] relative group ${
        isUser 
          ? "ml-auto bg-primary text-primary-foreground" 
          : "mr-auto bg-muted"
      }`}
    >
      {!isUser && (
        <Button
          variant="ghost" 
          size="icon"
          className="absolute -right-2 -top-2 h-6 w-6 bg-background border shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setIsTranslateOpen(!isTranslateOpen)}
          aria-label="Translate message"
        >
          <Globe className="h-3 w-3" />
        </Button>
      )}

      <div className="whitespace-pre-wrap break-words">
        {translatedContent || content}
      </div>

      {isTranslateOpen && !isUser && (
        <div className="mt-3 pt-2 border-t border-border/30 flex flex-wrap gap-1">
          {supportedLanguages.map(lang => (
            <Tooltip key={lang.code}>
              <TooltipTrigger asChild>
                <Button 
                  variant={translatingTo === lang.code ? "secondary" : "outline"} 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  disabled={isTranslating}
                  onClick={() => translateText(lang.code)}
                >
                  {translatingTo === lang.code && !isTranslating && <Check className="mr-1 h-3 w-3" />}
                  {isTranslating && translatingTo === lang.code ? 
                    <span className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin mr-1"></span> : null}
                  {lang.name}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Translate to {lang.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          
          {translatedContent && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-6"
              onClick={resetTranslation}
            >
              Show original
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs opacity-70">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};

export default TranslatableMessage;
