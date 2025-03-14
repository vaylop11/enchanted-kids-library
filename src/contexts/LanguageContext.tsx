
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
    
    // Story categories
    Animals: 'Animals',
    Adventure: 'Adventure',
    Fantasy: 'Fantasy',
    Bedtime: 'Bedtime',
    Educational: 'Educational',
    'Moral Stories': 'Moral Stories',
    Fables: 'Fables',
    
    // Stories translations
    // The Clever Monkey
    'The Clever Monkey': 'The Clever Monkey',
    'A clever monkey outwits a crocodile who tries to trick him.': 'A clever monkey outwits a crocodile who tries to trick him.',
    
    // The Cap Seller and the Monkeys
    'The Cap Seller and the Monkeys': 'The Cap Seller and the Monkeys',
    'A cap seller finds a clever way to get back his caps from mischievous monkeys.': 'A cap seller finds a clever way to get back his caps from mischievous monkeys.',
    
    // The Fox and the Grapes
    'The Fox and the Grapes': 'The Fox and the Grapes',
    'A fox tries to reach some high-hanging grapes but fails and declares them sour.': 'A fox tries to reach some high-hanging grapes but fails and declares them sour.',
    
    // The Ant and the Grasshopper
    'The Ant and the Grasshopper': 'The Ant and the Grasshopper',
    'A tale about the importance of hard work and planning for the future.': 'A tale about the importance of hard work and planning for the future.',
    
    // The Thirsty Crow
    'The Thirsty Crow': 'The Thirsty Crow',
    'A clever crow finds a way to drink water from a pitcher by dropping pebbles into it.': 'A clever crow finds a way to drink water from a pitcher by dropping pebbles into it.',
    
    // The Curious Fox
    'The Curious Fox': 'The Curious Fox',
    'A young fox explores the forest and learns about friendship.': 'A young fox explores the forest and learns about friendship.',
    
    // The Magic Paintbrush
    'The Magic Paintbrush': 'The Magic Paintbrush',
    'A child discovers a paintbrush that brings drawings to life.': 'A child discovers a paintbrush that brings drawings to life.',
    
    // The Lonely Star
    'The Lonely Star': 'The Lonely Star',
    'A star searches for friendship in the night sky.': 'A star searches for friendship in the night sky.',
    
    // The Great Garden Adventure
    'The Great Garden Adventure': 'The Great Garden Adventure',
    'Tiny insects embark on an epic journey across a garden.': 'Tiny insects embark on an epic journey across a garden.',
    
    // The Dancing Dinosaur
    'The Dancing Dinosaur': 'The Dancing Dinosaur',
    'A dinosaur discovers the joy of dancing despite being different.': 'A dinosaur discovers the joy of dancing despite being different.',
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
    
    // Story categories
    Animals: 'حيوانات',
    Adventure: 'مغامرات',
    Fantasy: 'خيال',
    Bedtime: 'قصص ما قبل النوم',
    Educational: 'تعليمية',
    'Moral Stories': 'قصص أخلاقية',
    Fables: 'حكايات',
    
    // Stories translations
    // The Clever Monkey
    'The Clever Monkey': 'القرد الذكي',
    'A clever monkey outwits a crocodile who tries to trick him.': 'قرد ذكي يتغلب بذكائه على تمساح يحاول خداعه.',
    
    // The Cap Seller and the Monkeys
    'The Cap Seller and the Monkeys': 'بائع القبعات والقرود',
    'A cap seller finds a clever way to get back his caps from mischievous monkeys.': 'بائع قبعات يجد طريقة ذكية لاستعادة قبعاته من القرود المشاغبة.',
    
    // The Fox and the Grapes
    'The Fox and the Grapes': 'الثعلب والعنب',
    'A fox tries to reach some high-hanging grapes but fails and declares them sour.': 'ثعلب يحاول الوصول إلى عنب معلق عالياً لكنه يفشل ويعلن أنه حامض.',
    
    // The Ant and the Grasshopper
    'The Ant and the Grasshopper': 'النملة والجندب',
    'A tale about the importance of hard work and planning for the future.': 'قصة عن أهمية العمل الجاد والتخطيط للمستقبل.',
    
    // The Thirsty Crow
    'The Thirsty Crow': 'الغراب العطشان',
    'A clever crow finds a way to drink water from a pitcher by dropping pebbles into it.': 'غراب ذكي يجد طريقة لشرب الماء من إبريق عن طريق إسقاط الحصى فيه.',
    
    // The Curious Fox
    'The Curious Fox': 'الثعلب الفضولي',
    'A young fox explores the forest and learns about friendship.': 'ثعلب صغير يستكشف الغابة ويتعلم عن الصداقة.',
    
    // The Magic Paintbrush
    'The Magic Paintbrush': 'فرشاة الرسم السحرية',
    'A child discovers a paintbrush that brings drawings to life.': 'طفل يكتشف فرشاة رسم تجعل الرسومات تنبض بالحياة.',
    
    // The Lonely Star
    'The Lonely Star': 'النجمة الوحيدة',
    'A star searches for friendship in the night sky.': 'نجمة تبحث عن الصداقة في سماء الليل.',
    
    // The Great Garden Adventure
    'The Great Garden Adventure': 'مغامرة الحديقة العظيمة',
    'Tiny insects embark on an epic journey across a garden.': 'حشرات صغيرة تنطلق في رحلة ملحمية عبر حديقة.',
    
    // The Dancing Dinosaur
    'The Dancing Dinosaur': 'الديناصور الراقص',
    'A dinosaur discovers the joy of dancing despite being different.': 'ديناصور يكتشف متعة الرقص رغم أنه مختلف.',
  }
};

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (language: Language) => void;
  t: (key: string) => string; // Changed from specific keys to any string
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
  const t = (key: string): string => {
    // @ts-ignore - We know the key might not be in translations, but we'll handle that
    const text = translations[language][key];
    
    // Handle dynamic values like year in copyright
    if (key === 'copyright') {
      return text?.replace('{year}', new Date().getFullYear().toString()) || key;
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
