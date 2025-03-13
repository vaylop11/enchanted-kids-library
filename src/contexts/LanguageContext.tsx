
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

// Define translations for the app
export const translations = {
  en: {
    // General
    home: 'Home',
    stories: 'Stories',
    welcomeToStoryTime: 'Welcome to StoryTime',
    discoverStories: 'Discover Magical Stories for Young Minds',
    description: 'Immerse your children in a world of imagination with our carefully crafted stories. Each tale is designed to inspire creativity, teach valuable lessons, and create cherished bedtime moments.',
    browseStories: 'Browse Stories',
    featuredStories: 'Featured Stories',
    viewAllStories: 'View all stories',
    storyCategories: 'Story Categories',
    
    // Story details
    backToStories: 'Back to stories',
    readingTime: 'reading time',
    ages: 'Ages',
    category: 'Category',
    ageRange: 'Age Range',
    
    // Footer
    copyright: '© {year} StoryTime. A magical place for children\'s stories.',
    
    // Not found
    notFound: '404',
    pageNotFound: 'Oops! Page not found',
    returnToHome: 'Return to Home',
    
    // Language
    switchToArabic: 'Switch to Arabic',
    switchToEnglish: 'Switch to English',
  },
  ar: {
    // General
    home: 'الرئيسية',
    stories: 'القصص',
    welcomeToStoryTime: 'مرحبًا بك في وقت القصة',
    discoverStories: 'اكتشف قصصًا سحرية للعقول الصغيرة',
    description: 'اغمر أطفالك في عالم من الخيال مع قصصنا المصممة بعناية. كل قصة مصممة لإلهام الإبداع، وتعليم دروس قيمة، وخلق لحظات نوم عزيزة.',
    browseStories: 'تصفح القصص',
    featuredStories: 'قصص مميزة',
    viewAllStories: 'عرض جميع القصص',
    storyCategories: 'فئات القصص',
    
    // Story details
    backToStories: 'العودة إلى القصص',
    readingTime: 'وقت القراءة',
    ages: 'الأعمار',
    category: 'الفئة',
    ageRange: 'الفئة العمرية',
    
    // Footer
    copyright: '© {year} وقت القصة. مكان سحري لقصص الأطفال.',
    
    // Not found
    notFound: '404',
    pageNotFound: 'عذراً! الصفحة غير موجودة',
    returnToHome: 'العودة إلى الصفحة الرئيسية',
    
    // Language
    switchToArabic: 'التبديل إلى العربية',
    switchToEnglish: 'التبديل إلى الإنجليزية',
  }
};

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (language: Language) => void;
  t: (key: keyof typeof translations.en) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    // Apply direction to html element
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    setDirection(language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  // Translation function
  const t = (key: keyof typeof translations.en): string => {
    const text = translations[language][key];
    
    // Handle dynamic values like year in copyright
    if (key === 'copyright') {
      return text.replace('{year}', new Date().getFullYear().toString());
    }
    
    return text || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
