
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import FAQSection from '@/components/FAQSection';
import UploadZone from '@/components/UploadZone';
import PDFLibrarySection from '@/components/PDFLibrarySection';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16">
        <HeroSection />
        
        {/* Upload Section */}
        <section className="py-16 bg-gradient-to-b from-background to-muted/10">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {language === 'ar' ? 'تحميل ملف PDF الخاص بك' : 'Upload Your PDF'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {language === 'ar'
                  ? 'قم بتحميل مستند PDF وترجمه فورًا. يمكنك ترجمة المستندات بسهولة.'
                  : 'Upload a PDF document and translate it instantly. Translate documents with ease.'}
              </p>
            </div>
            
            <UploadZone />
          </div>
        </section>
        
        {/* PDF Library Section - showing all uploaded PDFs */}
        {user && <PDFLibrarySection />}
        
        <FeaturesSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
