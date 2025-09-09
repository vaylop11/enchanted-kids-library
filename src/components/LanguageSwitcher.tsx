
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Languages, Check } from 'lucide-react';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { 
      code: 'en', 
      name: 'English', 
      nativeName: 'English',
      flag: '🇺🇸',
      description: 'Switch to English'
    },
    { 
      code: 'ar', 
      name: 'العربية', 
      nativeName: 'العربية',
      flag: '🇸🇦',
      description: 'التبديل إلى العربية'
    }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (newLanguage: 'en' | 'ar') => {
    if (newLanguage !== language) {
      setLanguage(newLanguage);
      const selectedLang = languages.find(lang => lang.code === newLanguage);
      toast.success(
        newLanguage === 'ar' 
          ? `تم التبديل إلى ${selectedLang?.nativeName}` 
          : `Switched to ${selectedLang?.nativeName}`,
        {
          duration: 2000,
          icon: selectedLang?.flag,
        }
      );
      setIsOpen(false);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "relative rounded-full px-3 py-2 transition-all duration-300",
            "hover:bg-primary/10 hover:text-primary hover:scale-105",
            "bg-card/80 backdrop-blur-sm border border-border/30",
            "shadow-sm hover:shadow-md hover:border-primary/30",
            isOpen && "bg-primary/10 text-primary scale-105"
          )}
          aria-label={currentLanguage?.description}
        >
          <div className="flex items-center gap-2">
            <div className="relative">
              <Globe className={cn(
                "h-4 w-4 transition-transform duration-300",
                isOpen && "rotate-12 scale-110"
              )} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse opacity-60" />
            </div>
            <span className="text-sm font-medium hidden sm:inline animate-fade-in">
              {currentLanguage?.flag}
            </span>
            <span className="text-xs font-semibold hidden md:inline">
              {currentLanguage?.nativeName}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-56 p-2 mt-2",
          "bg-card/95 backdrop-blur-lg border border-border/50",
          "shadow-2xl rounded-xl",
          "animate-scale-in origin-top-right",
          "z-50"
        )}
        sideOffset={8}
      >
        <div className="space-y-1">
          {languages.map((lang) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'en' | 'ar')}
              className={cn(
                "flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg",
                "transition-all duration-200 group",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                language === lang.code 
                  ? 'bg-primary/10 text-primary font-semibold shadow-sm' 
                  : 'hover:bg-primary/5 hover:text-primary hover:scale-[1.02]'
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl transition-transform duration-200 group-hover:scale-110">
                  {lang.flag}
                </span>
                <div className="flex flex-col flex-1">
                  <span className="font-medium text-sm">
                    {lang.nativeName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {lang.name}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {language === lang.code && (
                  <div className="flex items-center gap-1">
                    <Check className="h-4 w-4 text-primary animate-scale-in" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                )}
                <Languages className={cn(
                  "h-4 w-4 transition-all duration-200",
                  language === lang.code 
                    ? "text-primary opacity-100" 
                    : "text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary"
                )} />
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        
        {/* Language preference indicator */}
        <div className="mt-3 pt-2 border-t border-border/30">
          <div className="px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">
              {language === 'ar' 
                ? 'تم حفظ تفضيلك تلقائياً' 
                : 'Preference saved automatically'
              }
            </p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
