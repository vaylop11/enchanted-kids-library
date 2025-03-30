
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Languages } from 'lucide-react';

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-primary/5 to-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <div className="flex items-center gap-3 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-2">
            <Languages className="h-4 w-4" />
            <span>{language === 'ar' ? 'أكثر من 30 لغة مدعومة' : 'Over 30 languages supported'}</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl gradient-text">
            {language === 'ar' 
              ? 'ترجم ملفات PDF الخاصة بك بطريقة احترافية'
              : 'Translate Your PDFs Professionally'}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            {language === 'ar'
              ? 'ترجم مستنداتك بدقة وسرعة. ترجمة عالية الجودة لمحتوى PDF الخاص بك بدون فقدان التنسيق.'
              : 'Translate your documents with precision and speed. High-quality translation of your PDF content without losing formatting.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="px-8 rounded-full">
              <Link to="/pdfs">
                {language === 'ar' ? 'ابدأ الترجمة' : 'Start Translating'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 rounded-full">
              <Link to="/pdfs">
                {language === 'ar' ? 'استكشف المزيد' : 'Explore More'}
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0"></div>
    </section>
  );
};

export default HeroSection;
