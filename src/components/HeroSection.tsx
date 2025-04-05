
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section 
      className="py-20 md:py-28 bg-background relative overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8 md:space-y-12">
<h1 
  id="hero-heading"
  className="text-4xl md:text-6xl font-bold tracking-tighter max-w-3xl"
>
  {language === 'ar' 
    ? (
        <>
          تفاعل مع ملفات PDF بطريقة ذكية مع{' '}
          <span className="relative inline-block text-purple-600">
            Gemi تشات PDF
            <span className="absolute left-0 bottom-0 w-full h-1 bg-purple-400 rounded-md -z-10"></span>
          </span>
        </>
      )
    : (
        <>
          Chat with your PDFs intelligently with{' '}
          <span className="relative inline-block text-purple-600">
            Gemi ChatPDF
            <span className="absolute left-0 bottom-0 w-full h-1 bg-purple-400 rounded-md -z-10"></span>
          </span>
        </>
      )
  }
</h1>          
          <p className="text-xl text-muted-foreground max-w-2xl">
            {language === 'ar'
              ? 'تحدث مع مستنداتك وملفاتك الرقمية بشكل طبيعي. تحليل، استخراج واستكشاف محتويات PDF الخاصة بك بكفاءة مع Gemi.'
              : 'Talk to your documents naturally with Gemi ChatPDF. Analyze, extract, and explore your PDF contents efficiently - completely free!'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" className="px-8">
              <Link 
                to="/pdfs" 
                aria-label={language === 'ar' ? 'ابدأ استخدام تشات PDF الآن' : 'Get started with Gemi ChatPDF now'}
              >
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8">
              <Link 
                to="/blog" 
                aria-label={language === 'ar' ? 'تعلم المزيد عن خدمات تشات PDF' : 'Learn more about Gemi ChatPDF services'}
              >
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
