// pages/index.tsx
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import FAQSection from '@/components/FAQSection';
import UnifiedPDFInterface from '@/components/UnifiedPDFInterface';
import PDFGrid from '@/components/PDFGrid';
import SEO from '@/components/SEO';
import PlansSection from '@/components/PlansSection';

const Index = () => {
  const { language } = useLanguage();

  const pageTitle = language === 'ar'
    ? 'Gemi ChatPDF - اقرأ وتحدث مع ملفات PDF'
    : 'Gemi ChatPDF - Free AI PDF Chat & Reader';

  const pageDescription = language === 'ar'
    ? 'دردش مع ملفات PDF مجانًا باستخدام الذكاء الاصطناعي! قم بتحميل أي ملف PDF واحصل على إجابات فورية. تشات PDF هي الطريقة الذكية لاستخراج المعلومات من المستندات.'
    : 'Chat with PDFs for free using Gemi AI! Upload any PDF and get instant answers. Gemi ChatPDF is the smart way to extract information from documents.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background via-muted/5">
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords="Gemi ChatPDF, PDF chat, AI PDF reader, chat with PDF, free PDF analysis, document AI, PDF assistant"
        ogUrl="https://chatpdf.icu"
        canonicalUrl="https://chatpdf.icu"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://chatpdf.icu",
          "name": "Gemi ChatPDF",
          "description": pageDescription,
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://chatpdf.icu/pdfs?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        }}
      />

      <Navbar />

      <main>
        <HeroSection />
        <UnifiedPDFInterface />
        
        {/* Subscription Plans */}
        <section className="py-16 px-4 md:px-6 bg-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">
                {language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
              </h2>
              <p className="paragraph max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'اختر الخطة المناسبة لك واستمتع بمزايا إضافية'
                  : 'Choose the plan that suits you and enjoy additional benefits'
                }
              </p>
            </div>
            <PlansSection />
          </div>
        </section>
        {/* PDF Grid */}
        <PDFGrid />

        {/* Features */}
        <FeaturesSection />
        {/* FAQ */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
