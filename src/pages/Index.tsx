import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import FAQSection from '@/components/FAQSection';
import UploadZone from '@/components/UploadZone';
import PDFGrid from '@/components/PDFGrid';
import SEO from '@/components/SEO';
import StatsCard from '@/components/StatsCard';
import FeatureAnnouncementCard from '@/components/FeatureAnnouncementCard';
import CommunityAndTranslationCards from "@/components/CommunityAndTranslationCards";
const Index = () => {
  const {
    language
  } = useLanguage();
  const pageTitle = language === 'ar' ? 'Gemi ChatPDF - اقرأ وتحدث مع ملفات PDF' : 'Gemi ChatPDF - Free AI PDF Chat & Reader';
  const pageDescription = language === 'ar' ? 'دردش مع ملفات PDF مجانًا باستخدام الذكاء الاصطناعي! قم بتحميل أي ملف PDF واحصل على إجابات فورية. تشات PDF هي الطريقة الذكية لاستخراج المعلومات من المستندات.' : 'Chat with PDFs for free using Gemi AI! Upload any PDF and get instant answers. Gemi ChatPDF is the smart way to extract information from documents.';
  return <div className="min-h-screen bg-gradient-to-b from-background to-background via-muted/5">
      <SEO title={pageTitle} description={pageDescription} keywords="Gemi ChatPDF, PDF chat, AI PDF reader, chat with PDF, free PDF analysis, document AI, PDF assistant" ogUrl="https://chatpdf.icu" canonicalUrl="https://chatpdf.icu" schema={{
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://chatpdf.icu",
      "name": "Gemi ChatPDF",
      "description": "Chat with PDFs for free using Gemi AI! Upload any PDF and get instant answers.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://chatpdf.icu/pdfs?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }} />
      
      <Navbar />

      <main>
        <HeroSection />

        {/* Community & Translation Cards removed as per request */}

        {/* Info Cards Section */}
        <section className="py-6 bg-background">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            
          </div>
        </section>
        
        {/* Upload Section */}
        <section className="py-16 bg-muted/30" id="upload-pdf">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-4 text-primary">
                {language === 'ar' ? 'تحميل ملف PDF الخاص بك' : 'Upload Your PDF to Gemi ChatPDF'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {language === 'ar' ? 'قم بتحميل مستند PDF وابدأ التحدث معه فورًا. يمكنك طرح الأسئلة واستخراج المعلومات بسهولة.' : 'Upload a PDF document and start chatting with it instantly using Gemi ChatPDF. Ask questions and extract information with ease.'}
              </p>
            </div>
            
            <UploadZone />
          </div>
        </section>
        
        {/* All PDFs grid section */}
        <PDFGrid />
        
        <FeaturesSection />
        <FAQSection />
      </main>
      
      
      <Footer />
    </div>;
};
export default Index;