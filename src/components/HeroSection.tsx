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

{/* Background Image بدل الفيديو */}
<img
  src="https://res.cloudinary.com/dbjcwigtg/image/upload/v1760465061/gemi-logo_qzrbpe.webp"
  alt="Gemi ChatPDF Background"
  className="absolute inset-0 w-full h-full object-cover z-0"
/>


      {/* Gradient overlay from bottom */}
      <div
        className="absolute bottom-0 w-full h-1/4 z-[1]"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0) 7%, rgba(255, 255, 255, 0.7) 41%, rgba(255, 255, 255, 0.85) 64%, rgba(255, 255, 255, 0.95) 76%, rgb(255, 255, 255) 100%)",
        }}
      ></div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 max-w-6xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Headline */}
          <h1
            id="hero-heading"
            className="text-3xl md:text-6xl font-extrabold leading-tight tracking-tight text-white"
          >
            {language === "ar" ? (
              <>
                <span className="block">لدردشة ملفات PDF — Gemi ChatPDF</span>
                <span className="block">الأذكى، مدعومة بالذكاء الاصطناعي</span>
              </>
            ) : (
              <>
                <span className="block">Gemi ChatPDF</span>
                <span className="block">The Smarter, AI-Powered</span>
              </>
            )}
          </h1>

          {/* Subheadline */}
         <p
          style={{ animationDelay: '0.3s' }}
          className="mt-12 mb-12 animate-fade-in text-xl text-white font-medium leading-relaxed max-w-3xl mx-auto bg-white/20 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30"
        >
            {language === "ar"
              ? "ارفع أي ملف PDF وتحدث معه بذكاء: اسأل، لخص، استخرج المعلومة، واحصل على استشهادات خلال ثوانٍ — مجانًا مع Gemi ChatPDF."
              : "Upload any PDF and chat with it intelligently: ask questions, get summaries, extract facts, and cite sources in seconds — free with Gemi ChatPDF."}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2 justify-center">
            <Button
              asChild
              size="lg"
              className="mt-12 px-8 bg-slate-900 text-lg text-primary-foreground rounded-full transition-all duration-300 font-bold"
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
