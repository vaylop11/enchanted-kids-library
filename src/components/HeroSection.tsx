import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
const HeroSection = () => {
  const {
    language
  } = useLanguage();
  return <section className="relative py-20 md:py-28 bg-gradient-to-b from-purple-50/60 via-background to-muted overflow-hidden" aria-labelledby="hero-heading">
      {/* Decorative blurred background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-36 -left-40 w-[560px] h-[360px] rounded-full bg-purple-200 opacity-40 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-40 w-[480px] h-[300px] rounded-full bg-purple-100 opacity-40 blur-2xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        {/* Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6">
          <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-foreground mb-3 mx-0 text-center">
            {language === "ar" ? <>
                تفاعل مع ملفات PDF بطريقة ذكية مع{" "}
                <span className="relative inline-block text-purple-800">
                  Gemi ChatPDF
                  <span className="absolute left-0 -bottom-1 w-full h-2 bg-purple-300 rounded opacity-70 -z-10"></span>
                </span>
              </> : <>
                Chat with your PDFs intelligently with{" "}
                <span className="relative inline-block text-purple-800">
                  Gemi ChatPDF
                  <span className="absolute left-0 -bottom-1 w-full h-2 bg-purple-300 rounded opacity-70 -z-10"></span>
                </span>
              </>}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
            {language === "ar" ? "تحدث مع مستنداتك وملفاتك الرقمية بشكل طبيعي. تحليل، استخراج واستكشاف محتويات PDF الخاصة بك بكفاءة مع Gemi." : "Talk to your documents naturally with Gemi ChatPDF. Analyze, extract, and explore your PDF contents efficiently - completely free!"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
            <Button asChild size="lg" className="px-8 bg-purple-800 hover:bg-purple-900 shadow-md">
              <Link to="/pdfs" aria-label={language === "ar" ? "ابدأ استخدام تشات PDF الآن" : "Get started with Gemi ChatPDF now"}>
                {language === "ar" ? "ابدأ الآن" : "Get Started"}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-8 border-purple-700 text-purple-800 hover:bg-purple-100">
              <Link to="/blog" aria-label={language === "ar" ? "تعلم المزيد عن خدمات تشات PDF" : "Learn more about Gemi ChatPDF services"}>
                {language === "ar" ? "تعلم المزيد" : "Learn More"}
              </Link>
            </Button>
          </div>
        </div>
        {/* Lottie Animation */}
        <div className="flex-1 flex items-center justify-center md:justify-end min-w-[280px]">
          <div className="rounded-3xl overflow-hidden shadow-xl bg-white/40 backdrop-blur-lg border border-purple-100/70 max-w-xs md:max-w-sm p-4">
            
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;