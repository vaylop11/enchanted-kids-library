import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PlansSection from '@/components/PlansSection';

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background via-muted/5">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'ar'
                ? 'اختر الخطة المناسبة لك واستمتع بمزايا إضافية'
                : 'Choose the plan that suits you and enjoy additional benefits'
              }
            </p>
          </div>

          <PlansSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
