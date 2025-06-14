
import React from 'react';
import { Languages, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supportedLanguages } from '@/services/translationService';
import { useLanguage } from '@/contexts/LanguageContext';

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onValueChange,
  disabled = false
}) => {
  const { language } = useLanguage();

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 text-primary">
        <Globe className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:inline">
          {language === 'ar' ? 'ترجم إلى:' : 'Translate to:'}
        </span>
      </div>
      
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px] sm:w-[200px]">
          <SelectValue placeholder={language === 'ar' ? 'اختر لغة' : 'Select language'} />
        </SelectTrigger>
        <SelectContent>
          {supportedLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                {lang.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
