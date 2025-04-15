
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileUp, Languages, Zap } from 'lucide-react';
import SEO from '@/components/SEO';
import ProSubscriptionCard from '@/components/ProSubscriptionCard';
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { createSubscription, getSubscriptionPlans, type SubscriptionPlan } from '@/services/subscriptionService';

const SubscribePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  
  useEffect(() => {
    const loadPlan = async () => {
      const plans = await getSubscriptionPlans();
      if (plans.length > 0) {
        setPlan(plans[0]); // Get the first plan (our PRO plan)
      }
    };
    
    loadPlan();
  }, []);
  
  React.useEffect(() => {
    if (!user) {
      navigate('/signin?redirect=subscribe');
    }
  }, [user, navigate]);

  const handlePayPalApprove = async (data: any) => {
    if (!plan) return;
    
    try {
      await createSubscription(data.subscriptionID, plan.id);
      navigate('/pdfs'); // Redirect to PDFs page after successful subscription
    } catch (error) {
      console.error('Error processing subscription:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background via-muted/5">
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
          {/* Plan Details */}
          <div className="order-2 md:order-1">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'ar' ? 'ما الذي تحصل عليه مع Gemi PRO:' : 'What you get with Gemi PRO:'}
            </h2>
            
            <div className="space-y-5 mb-8">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <FileUp className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {language === 'ar' ? 'تحميل ما يصل إلى 20 ملف PDF' : 'Upload up to 20 PDFs'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' 
                      ? 'احتفظ بمستنداتك المتعددة في مكان واحد وتفاعل معها بسهولة'
                      : 'Keep your multiple documents in one place and interact with them easily'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Languages className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {language === 'ar' ? 'ميزة الترجمة الفورية' : 'Translation Feature'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' 
                      ? 'ترجم ملفات PDF والردود إلى أي لغة تريدها على الفور'
                      : 'Instantly translate your PDFs and responses to any language you want'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">
                    {language === 'ar' ? 'استجابة أسرع 10 مرات' : '10× Faster Response'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'ar' 
                      ? 'استمتع بمعالجة ذات أولوية واحصل على إجابات في ثوانٍ'
                      : 'Enjoy priority processing and get answers in seconds'}
                  </p>
                </div>
              </div>
            </div>
            
            {plan && (
              <PayPalScriptProvider options={{ 
                clientId: "YOUR_PAYPAL_CLIENT_ID",
                vault: true,
                intent: "subscription"
              }}>
                <PayPalButtons
                  createSubscription={(data, actions) => {
                    return actions.subscription.create({
                      'plan_id': plan.paypal_plan_id
                    });
                  }}
                  onApprove={handlePayPalApprove}
                  style={{ layout: "vertical" }}
                  className="w-full mt-4"
                />
              </PayPalScriptProvider>
            )}
            
            <p className="text-sm text-center text-muted-foreground mt-3">
              {language === 'ar' 
                ? 'يمكنك الإلغاء في أي وقت. لا توجد رسوم إضافية.'
                : 'Cancel anytime. No hidden fees.'}
            </p>
          </div>
          
          {/* Subscription Card */}
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
