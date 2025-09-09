import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section
      className="relative py-20 md:py-28 bg-white overflow-hidden"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-6 md:px-8 max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8">

          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900"
          >
            {language === "ar" ? (
              <>
                <span className="block">الأذكى، مدعومة بالذكاء الاصطناعي</span>
                <span className="block">لدردشة ملفات PDF — Gemi ChatPDF</span>
              </>
            ) : (
              <>
                <span className="block">The Smarter, AI-Powered</span>
                <span className="block">PDF Chat — Gemi ChatPDF</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl">
            {language === "ar"
              ? "ارفع أي ملف PDF وتحدث معه بذكاء: اسأل، لخص، استخرج المعلومة، واحصل على استشهادات خلال ثوانٍ — مجانًا مع Gemi ChatPDF."
              : "Upload any PDF and chat with it intelligently: ask questions, get summaries, extract facts, and cite sources in seconds — free with Gemi ChatPDF."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center">
            <Button
              asChild
              size="lg"
              className="mt-8 px-8 bg-slate-900 text-primary-foreground rounded-full transition-all duration-300 font-bold"
            >
              <Link to="/pdfs">
                {language === "ar" ? "ابدأ الأن" : "Start Now"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
