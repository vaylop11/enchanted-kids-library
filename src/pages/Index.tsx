
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import BlogSection from '@/components/BlogSection';
import FAQSection from '@/components/FAQSection';

const Index = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        <HeroSection />
        <FeaturesSection />
        <BlogSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
