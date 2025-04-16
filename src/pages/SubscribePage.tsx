
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock } from 'lucide-react';
import SEO from '@/components/SEO';
import ProSubscriptionCard from '@/components/ProSubscriptionCard';

const SubscribePage = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [key] = React.useState(Date.now());

  return (
    <div key={key} className="min-h-screen bg-gradient-to-b from-background to-background via-muted/5">
      <SEO 
        title={language === 'ar' ? 'Gemi PRO - اشتراك' : 'Subscribe to Gemi PRO'}
        description={language === 'ar' 
          ? 'ارتق بتجربتك مع Gemi PRO. احصل على ميزات متقدمة وسرعات استجابة أعلى.'
          : 'Upgrade your experience with Gemi PRO. Get advanced features and faster response speeds.'
        }
      />
      
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 max-w-5xl py-12">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="flex items-center gap-2 mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'ar' ? 'العودة' : 'Back'}
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {language === 'ar' ? 'اشترك في Gemi PRO' : 'Subscribe to Gemi PRO'}
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            {language === 'ar' 
              ? 'ارتقِ بتجربتك واحصل على ميزات حصرية'
              : 'Upgrade your experience and unlock exclusive features'}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="order-2 md:order-1">
            <div className="bg-background rounded-lg border p-6 mb-4">
              <div className="flex flex-col items-center justify-center text-center">
                <Clock className="h-12 w-12 text-primary mb-4 animate-pulse" />
                <h2 className="text-xl font-semibold mb-2">
                  {language === 'ar' ? 'قريباً' : 'Coming Soon'}
                </h2>
                <p className="text-muted-foreground mb-4">
                  {language === 'ar'
                    ? 'نحن نعمل على تحسين تجربة Gemi PRO. سيتم إطلاق الاشتراكات قريباً.'
                    : 'We are working on enhancing the Gemi PRO experience. Subscriptions will be available soon.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="mt-2"
                >
                  {language === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Home'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2">
            <ProSubscriptionCard />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscribePage;
