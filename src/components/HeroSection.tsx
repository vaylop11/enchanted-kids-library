
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section
      className="relative py-24 md:py-32 bg-gradient-to-br from-slate-50 via-white to-purple-50/30 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Enhanced decorative background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[400px] rounded-full bg-gradient-to-r from-purple-300/20 to-blue-300/20 blur-3xl opacity-60"></div>
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[350px] rounded-full bg-gradient-to-l from-purple-200/30 to-indigo-200/30 blur-3xl opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-r from-violet-100/20 to-purple-100/20 blur-2xl opacity-40"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 max-w-7xl relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Enhanced Content */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-8">
          <div className="space-y-6">
            <h1
              id="hero-heading"
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-slate-900 mb-4"
            >
              {language === "ar" ? (
                <>
                  تفاعل مع ملفات PDF بطريقة ذكية مع{" "}
                  <span className="relative inline-block bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Gemi ChatPDF
                    <span className="absolute left-0 -bottom-2 w-full h-3 bg-gradient-to-r from-purple-300/40 to-violet-300/40 rounded-full blur-sm -z-10"></span>
                  </span>
                </>
              ) : (
                <>
                  Chat with your PDFs intelligently with{" "}
                  <span className="relative inline-block bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                    Gemi ChatPDF
                    <span className="absolute left-0 -bottom-2 w-full h-3 bg-gradient-to-r from-purple-300/40 to-violet-300/40 rounded-full blur-sm -z-10"></span>
                  </span>
                </>
              )}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-2xl leading-relaxed font-light">
              {language === "ar"
                ? "تحدث مع مستنداتك وملفاتك الرقمية بشكل طبيعي. تحليل، استخراج واستكشاف محتويات PDF الخاصة بك بكفاءة مع Gemi."
                : "Transform how you interact with documents. Analyze, extract, and explore your PDF contents with AI-powered intelligence - completely free."}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
            <Button 
              asChild 
              size="lg" 
              className="px-8 py-4 bg-gradient-to-r from-purple-700 to-violet-700 hover:from-purple-800 hover:to-violet-800 shadow-xl shadow-purple-200 text-lg font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-purple-300 hover:-translate-y-0.5"
            >
              <Link
                to="/pdfs"
                aria-label={
                  language === "ar"
                    ? "ابدأ استخدام تشات PDF الآن"
                    : "Get started with Gemi ChatPDF now"
                }
              >
                {language === "ar" ? "ابدأ الآن" : "Get Started"}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-8 py-4 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-lg font-medium transition-all duration-300 hover:shadow-lg backdrop-blur-sm bg-white/80"
            >
              <Link
                to="/blog"
                aria-label={
                  language === "ar"
                    ? "تعلم المزيد عن خدمات تشات PDF"
                    : "Learn more about Gemi ChatPDF services"
                }
              >
                {language === "ar" ? "تعلم المزيد" : "Learn More"}
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Enhanced Lottie Animation */}
        <div className="flex-1 flex items-center justify-center md:justify-end min-w-[320px]">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-violet-400/20 rounded-3xl blur-xl scale-110"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white/70 backdrop-blur-xl border border-white/50 max-w-sm md:max-w-md p-6 hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <DotLottieReact
                src="https://lottie.host/bad7d1d7-7774-4f1e-a0e6-1f39049481c7/IexjqgAIYx.lottie"
                loop
                autoplay
                className="w-full h-72 md:h-96"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
