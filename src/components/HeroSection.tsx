
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { Languages } from 'lucide-react'; // Replace Translate with Languages icon

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl">
            {language === 'ar' 
              ? 'ترجم ملفات PDF بكفاءة مع ترانسليت PDF'
              : 'Translate PDFs efficiently with TranslatePDF'}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            {language === 'ar'
              ? 'ترجم مستنداتك بشكل طبيعي. ترجمة سريعة ودقيقة لمحتويات PDF الخاصة بك.'
              : 'Translate your documents naturally. Fast and accurate translation of your PDF contents.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/pdfs">
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
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
