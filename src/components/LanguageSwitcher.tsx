
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleLanguage}
          className="text-foreground/60 hover:text-foreground"
          aria-label={language === 'en' ? t('switchToArabic') : t('switchToEnglish')}
        >
          <Globe className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {language === 'en' ? t('switchToArabic') : t('switchToEnglish')}
      </TooltipContent>
    </Tooltip>
  );
};

export default LanguageSwitcher;
