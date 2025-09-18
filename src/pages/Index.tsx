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
import StatsCard from '@/components/StatsCard';
import SubscriptionCard from '@/components/SubscriptionCard';

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

        {/* Platform Statistics */}
        <section className="py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <h2 className="heading-2 mb-4">
                {language === 'ar' ? 'إحصائيات المنصة' : 'Platform Statistics'}
              </h2>
              <p className="paragraph max-w-2xl mx-auto">
                {language === 'ar'
                  ? 'انضم إلى آلاف المستخدمين الذين يستفيدون من تقنياتنا المتقدمة'
                  : 'Join thousands of users who benefit from our advanced technologies'
                }
              </p>
            </div>
            <StatsCard className="max-w-2xl mx-auto" />
          </div>
        </section>

        {/* PDF Grid */}
        <PDFGrid />

        {/* Features */}
        <FeaturesSection />

        {/* Subscription Plans */}
        <section className="py-16 px-4 md:px-6 bg-gray-50">
          <div className="container mx-auto max-w-7xl text-center">
            <h2 className="heading-2 mb-8">
              {language === 'ar' ? 'اختر اشتراكك' : 'Choose Your Subscription'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SubscriptionCard
                title={language === 'ar' ? 'Gemi Free' : 'Gemi Free'}
                price="$0"
                features={[
                  language === 'ar' ? 'الدردشة مع ملفات PDF' : 'Chat with PDFs',
                  language === 'ar' ? 'إجابات AI أساسية' : 'Basic AI Responses'
                ]}
                paypalLink="#"
              />
              <SubscriptionCard
                title="Gemi Pro"
                price="$10 / month"
                features={[
                  language === 'ar' ? 'دردشة غير محدودة مع PDF' : 'Unlimited PDF Chats',
                  language === 'ar' ? 'إجابات AI متقدمة' : 'Priority AI Responses',
                  language === 'ar' ? 'تحليلات متقدمة' : 'Advanced Analytics'
                ]}
                paypalLink="https://www.paypal.com/ncp/payment/8YELQBG5C55VU"
                highlighted
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
