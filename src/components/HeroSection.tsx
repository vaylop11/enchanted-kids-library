import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const HeroSection = () => {
  const { language } = useLanguage();

  return (
    <section
      className="relative pt-0 pb-20 md:pb-28 bg-white overflow-hidden min-h-screen"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      {/* Background Video - Extended to cover header */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 w-full h-full object-cover z-0"
        style={{ top: 0 }}
      >
        <source src="https://res.cloudinary.com/dbjcwigtg/video/upload/v1757516724/hero-video_qz89bf.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for better text readability on header */}
      <div className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-transparent z-[1]" />

      {/* Content overlay for main section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white z-[1]" />
      
      {/* Bottom gradient overlay */}
      <div
        className="absolute bottom-0 w-full h-1/2 z-[2]"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.3) 20%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.9) 80%, rgb(255, 255, 255) 100%)",
        }}
      ></div>

      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 max-w-6xl relative z-10 pt-24 md:pt-32">
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
              className="mt-12 px-8 bg-slate-900 text-primary-foreground rounded-full transition-all duration-300 font-bold"
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
