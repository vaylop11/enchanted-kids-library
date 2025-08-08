import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
const HeroSection = () => {
  const {
    language
  } = useLanguage();
    return <section className="relative py-20 md:py-28 bg-gradient-to-b from-primary/5 via-background to-muted/30 overflow-hidden" aria-labelledby="hero-heading">
      {/* Enhanced decorative background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-primary/20 to-primary-glow/20 blur-3xl float-animation"></div>
        <div className="absolute -bottom-32 -right-40 w-[500px] h-[320px] rounded-full bg-gradient-to-l from-accent/20 to-secondary/20 blur-2xl float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-primary/10 blur-2xl opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-foreground mb-3 mx-0 text-center font-display">
            {language === "ar" ? <>
                تفاعل مع ملفات PDF بطريقة ذكية مع{" "}
                <span className="relative inline-block gradient-text glow-effect">
                  Gemi ChatPDF
                  <span className="absolute left-0 -bottom-2 w-full h-3 bg-gradient-to-r from-primary/30 to-primary-glow/30 rounded-lg -z-10"></span>
                </span>
              </> : <>
                Chat with your PDFs intelligently with{" "}
                <span className="relative inline-block gradient-text glow-effect">
                  Gemi ChatPDF
                  <span className="absolute left-0 -bottom-2 w-full h-3 bg-gradient-to-r from-primary/30 to-primary-glow/30 rounded-lg -z-10"></span>
                </span>
              </>}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            {language === "ar" ? "تحدث مع مستنداتك وملفاتك الرقمية بشكل طبيعي. تحليل، استخراج واستكشاف محتويات PDF الخاصة بك بكفاءة مع Gemi." : "Talk to your documents naturally with Gemi ChatPDF. Analyze, extract, and explore your PDF contents efficiently - completely free!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
            <Button asChild size="lg" className="px-8 bg-primary hover:bg-primary-dark shadow-elegant glow-effect">
              <Link to="/pdfs" aria-label={language === "ar" ? "ابدأ استخدام تشات PDF الآن" : "Get started with Gemi ChatPDF now"}>
                {language === "ar" ? "ابدأ الآن" : "Get Started"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 border-primary/50 text-primary hover:bg-primary/10 glass-effect">
              <Link to="#features" aria-label={language === "ar" ? "تعلم المزيد عن خدمات تشات PDF" : "Learn more about Gemi ChatPDF services"}>
                {language === "ar" ? "تعلم المزيد" : "Learn More"}
              </Link>
            </Button>
          </div>
        </div>
        {/* Lottie Animation */}
        <div className="flex-1 flex items-center justify-center md:justify-end min-w-[280px]">
          <div className="rounded-3xl overflow-hidden shadow-elegant glass-effect border border-primary/20 max-w-xs md:max-w-sm p-6 hover-lift">
            <DotLottieReact
              src="https://lottie.host/bad7d1d7-7774-4f1e-a0e6-1f39049481c7/IexjqgAIYx.lottie"
              loop
              autoplay
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;