
import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface SupportedLanguage {
  code: string;
  name: string;
  localName: string;
}

export const supportedLanguages: SupportedLanguage[] = [
  { code: 'ar', name: 'Arabic', localName: 'العربية' },
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'fr', name: 'French', localName: 'Français' },
  { code: 'es', name: 'Spanish', localName: 'Español' },
  { code: 'de', name: 'German', localName: 'Deutsch' },
  { code: 'zh', name: 'Chinese', localName: '中文' },
  { code: 'ru', name: 'Russian', localName: 'Русский' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
  { code: 'hi', name: 'Hindi', localName: 'हिन्दी' },
  { code: 'pt', name: 'Portuguese', localName: 'Português' },
];

interface LanguageSelectorProps {
  onSelectLanguage: (language: SupportedLanguage) => void;
  buttonVariant?: "default" | "outline" | "secondary";
  buttonSize?: "default" | "sm";
  className?: string;
  excludeCurrentLanguage?: boolean;
}

const LanguageSelector = ({ 
  onSelectLanguage,
  buttonVariant = "outline",
  buttonSize = "sm",
  className = "",
  excludeCurrentLanguage = true
}: LanguageSelectorProps) => {
  const { language, direction } = useLanguage();
  
  const currentLang = language === 'ar' ? 'العربية' : 'English';
  const menuTitle = language === 'ar' ? 'اختر لغة الترجمة' : 'Select translation language';
  
  const filteredLanguages = excludeCurrentLanguage 
    ? supportedLanguages.filter(lang => lang.code !== language)
    : supportedLanguages;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize} className={className}>
          <Languages className="mr-2 h-4 w-4" />
          {language === 'ar' ? 'ترجمة إلى' : 'Translate to'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={direction === 'rtl' ? 'end' : 'start'} dir={direction}>
        <DropdownMenuLabel>{menuTitle}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filteredLanguages.map((lang) => (
          <DropdownMenuItem 
            key={lang.code}
            onClick={() => onSelectLanguage(lang)}
            className="cursor-pointer"
          >
            <span className="mr-2">{lang.localName}</span>
            <span className="text-muted-foreground">({lang.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
