import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section 
      className={`relative py-20 md:py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-gray-950 dark:to-slate-900 overflow-hidden transition-colors duration-500`}
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* خلفيات تزيينية متحركة */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* كرة تدرج زرقاء */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-primary/30 rounded-full blur-3xl animate-pulse"></div>
        
        {/* كرة بنفسجية فاتحة */}
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-gradient-to-tr from-violet-300/20 to-pink-300/20 rounded-full blur-2xl opacity-70 animate-blob"></div>
        
        {/* كرة خضراء شفافة */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-bl from-emerald-200/20 to-transparent rounded-full blur-2xl animate-blob" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-16">
          
          {/* النص */}
          <div className="flex-1 text-center md:text-left space-y-7 max-w-xl md:max-w-2xl">
            <h1 
              id="hero-heading" 
              className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-slate-900 to-slate-700 dark:from-slate-100 dark:via-slate-200 dark:to-slate-300"
            >
              {language === "ar" ? (
                <>
                  تفاعل مع ملفاتك <br />
                  <span className="relative inline-block text-primary">
                    PDF بذكاء
                    <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary/30 rounded-full animate-pulse"></span>
                  </span>
                </>
              ) : (
                <>
                  Chat with your <br />
                  <span className="relative inline-block text-primary">
                    PDFs Intelligently
                    <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-primary/30 rounded-full animate-pulse"></span>
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {language === "ar"
                ? "اسأل، استخرج، وافهم مستنداتك بدقة. Gemi يحول ملفات PDF إلى محادثة ذكية وسهلة."
                : "Ask, extract, and understand your documents with precision. Gemi turns PDFs into smart, natural conversations."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center md:justify-start">
              <Button 
                asChild 
                size="lg" 
                className="px-8 bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
              >
                <Link to="/pdfs" aria-label={language === "ar" ? "ابدأ الآن" : "Get started now"}>
                  {language === "ar" ? "ابدأ الآن" : "Get Started"}
                </Link>
              </Button>

              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="px-8 border-primary/50 text-primary hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-300 font-medium backdrop-blur-sm"
              >
                <Link to="#features" aria-label={language === "ar" ? "اكتشف الميزات" : "Discover features"}>
                  {language === "ar" ? "اكتشف الميزات" : "Learn More"}
                </Link>
              </Button>
            </div>
          </div>

          {/* بطاقة العرض (بدون Lottie) */}
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative max-w-xs md:max-w-md w-full">
              {/* بطاقة العرض الأساسية */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 backdrop-blur-sm transition-all duration-500 hover:shadow-3xl hover:scale-105">
                
                {/* شريط العنوان (مثل متصفح) */}
                <div className="flex items-center gap-2 mb-5 px-1">
                  <div className="flex space-x-2 space-x-reverse">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400">chatpdf.icu</span>
                  </div>
                </div>

                {/* محتوى المحادثة التوضيحي */}
                <div className="space-y-4">
                  <div className="bg-primary/10 dark:bg-primary/20 text-primary rounded-2xl rounded-tr-md p-4 text-sm max-w-[85%] ml-auto">
                    <p className="font-medium">ما ملخص هذا البحث العلمي؟</p>
                  </div>
                  <div className="bg-muted text-foreground rounded-2xl rounded-tl-md p-4 text-sm max-w-[90%]">
                    <p>بالطبع! يتناول البحث تأثيرات الذكاء الاصطناعي على التعليم، مع تركيز على التخصيص والتفاعل...</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">{language === "ar" ? "يكتب..." : "Typing..."}</span>
                  </div>
                </div>
              </div>

              {/* زخرفة صغيرة */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* موجة تزيينية في الأسفل */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-current text-white dark:text-slate-900">
          <path fillOpacity="0.1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,218.7C960,235,1056,245,1152,229.3C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
