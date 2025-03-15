
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl">
            {language === 'ar' 
              ? 'تفاعل مع ملفات PDF بطريقة ذكية مع تشات PDF'
              : 'Chat with your PDFs intelligently with ChatPDF'}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl">
            {language === 'ar'
              ? 'تحدث مع مستنداتك وملفاتك الرقمية بشكل طبيعي. تحليل، استخراج واستكشاف محتويات PDF الخاصة بك بكفاءة.'
              : 'Talk to your documents naturally. Analyze, extract, and explore your PDF contents efficiently.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="px-8">
              <Link to="/pdfs">
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link to="/blog">
                {language === 'ar' ? 'تعلم المزيد' : 'Learn More'}
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
