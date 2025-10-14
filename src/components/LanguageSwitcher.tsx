import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      const selectedLang = languages.find(lang => lang.code === newLanguage);
      
      toast.success(
        language === 'ar' 
          ? `Switched to ${selectedLang?.name}` 
          : `تم التبديل إلى ${selectedLang?.name}`,
        { duration: 1500 }
      );
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-3 gap-2 bg-black text-white rounded-full shadow-lg flex items-center justify-center"
        >
          <Globe className="h-4 w-4 text-white" />
          <span className="hidden sm:inline text-sm">{currentLanguage?.flag}</span>
          <span className="hidden md:inline text-sm">{currentLanguage?.name}</span>
          <ChevronDown className="h-3 w-3 text-white opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-40 bg-black rounded-xl shadow-lg border border-gray-800"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as 'en' | 'ar')}
            className={cn(
              "flex items-center gap-2 cursor-pointer text-white hover:bg-gray-900 focus:bg-gray-900 rounded-lg px-3 py-2",
              language === lang.code && "bg-gray-800"
            )}
          >
            <span>{lang.flag}</span>
            <span className="flex-1">{lang.name}</span>
            {language === lang.code && (
              <Check className="h-4 w-4 text-white" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
