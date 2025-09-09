import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section 
      className="relative py-20 md:py-32 bg-white overflow-hidden transition-colors duration-500"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-6 md:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* العنوان الرئيسي */}
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
            {language === "ar" ? (
              <>
                منصة أذكى، مدعومة بالذكاء الاصطناعي <br />
                <span className="block">وموزعة بالكامل</span>
              </>
            ) : (
              <>
                The Smarter, AI-Powered <br />
                <span className="block">Decentralized Marketplace</span>
              </>
            )}
          </h1>

          {/* الوصف */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
            {language === "ar"
              ? "استفد من قوة الذكاء الاصطناعي الموزع مع AICM."
              : "Harness the power of decentralized AI marketplace with AICM."}
          </p>

          {/* الأزرار */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="px-8 bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              <Link to="/pdfs">
                {language === "ar" ? "ابدأ الآن" : "Get Started"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
