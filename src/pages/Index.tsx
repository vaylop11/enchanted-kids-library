
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import StatsCard from '@/components/StatsCard';
import RecentPDFs from '@/components/RecentPDFs';
import FAQSection from '@/components/FAQSection';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import SEO from '@/components/SEO';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <SEO 
        title={language === 'ar' ? 'PDF مجاني - حلول PDF الشاملة' : 'Free PDF - Complete PDF Solutions'}
        description={language === 'ar' 
          ? 'موقع مجاني لتحويل وتحرير وترجمة ملفات PDF بسهولة وأمان. أدوات احترافية لجميع احتياجاتك من PDF.'
          : 'Free platform to convert, edit, and translate PDF files easily and securely. Professional tools for all your PDF needs.'}
      />
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <StatsCard />
        <RecentPDFs />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
