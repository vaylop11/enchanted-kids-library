
import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Languages } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="relative rounded-full px-3 py-2 hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-105 border border-border/20 backdrop-blur-sm"
          aria-label={language === 'en' ? t('switchToArabic') : t('switchToEnglish')}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium hidden sm:inline">
              {currentLanguage?.flag}
            </span>
            <span className="text-xs font-medium hidden md:inline">
              {language.toUpperCase()}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 glass-effect backdrop-blur-md border border-border/20 shadow-elegant rounded-xl"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'en' | 'ar')}
            className={`
              flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-200
              ${language === lang.code 
                ? 'bg-primary/10 text-primary font-medium' 
                : 'hover:bg-primary/5 hover:text-primary'
              }
            `}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex flex-col">
              <span className="font-medium">{lang.name}</span>
              <span className="text-xs text-muted-foreground">
                {lang.code === 'en' ? 'English' : 'Arabic'}
              </span>
            </div>
            {language === lang.code && (
              <Languages className="h-4 w-4 ml-auto text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
