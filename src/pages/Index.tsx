
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import FAQSection from '@/components/FAQSection';
import UploadZone from '@/components/UploadZone';
import { useAuth } from '@/contexts/AuthContext';
import PDFGrid from '@/components/PDFGrid';

const Index = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background via-muted/5">
      <Navbar />

      <main>
        <HeroSection />
        
        {/* Upload Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {language === 'ar' ? 'تحميل ملف PDF الخاص بك' : 'Upload Your PDF'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {language === 'ar'
                  ? 'قم بتحميل مستند PDF وابدأ التحدث معه فورًا. يمكنك طرح الأسئلة واستخراج المعلومات بسهولة.'
                  : 'Upload a PDF document and start chatting with it instantly. Ask questions and extract information with ease.'
                }
              </p>
            </div>
            
            <UploadZone />
          </div>
        </section>
        
        {/* All PDFs Section */}
        <PDFGrid />
        
        <FeaturesSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
