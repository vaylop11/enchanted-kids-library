
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import ProSubscriptionCard from '@/components/ProSubscriptionCard';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { 
  createSubscription, 
  getSubscriptionPlans,
  type SubscriptionPlan,
  getPayPalPlanIdFromDatabase 
} from '@/services/subscriptionService';
import { toast } from 'sonner';

const SubscribePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paypalPlanId, setPaypalPlanId] = useState<string>('P-8AR43998YB6934043M77H5AI');
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [key, setKey] = useState(Date.now());
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paypalButtonLoaded, setPaypalButtonLoaded] = useState(false);
  
  useEffect(() => {
    setKey(Date.now());
  }, [language]);

  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const plans = await getSubscriptionPlans();
        console.log("Loaded plans:", plans);
        if (plans.length > 0) {
          const proPlan = plans.find(p => p.name === 'Gemi PRO') || plans[plans.length - 1];
          const updatedPlan = { ...proPlan, price: proPlan.price || 4.99 };
          setPlan(updatedPlan);
          console.log("Selected plan:", updatedPlan);
          
          try {
            const paypalId = await getPayPalPlanIdFromDatabase();
            if (paypalId) {
              setPaypalPlanId(paypalId);
              console.log("Set PayPal Plan ID:", paypalId);
            }
          } catch (error) {
            console.error("Failed to get PayPal Plan ID:", error);
          }
        }
      } catch (error) {
        console.error("Error loading subscription plans:", error);
        toast.error(language === 'ar' 
          ? 'فشل في تحميل خطط الاشتراك' 
          : 'Failed to load subscription plans');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlan();
  }, [language]);
  
  useEffect(() => {
    if (!user) {
      navigate('/signin?redirect=subscribe');
    }
  }, [user, navigate]);

  const handlePayPalApprove = async (data: any) => {
    if (!plan) return;
    
    try {
      setProcessingPayment(true);
      console.log("Subscription approved:", data);
      console.log("Subscription ID:", data.subscriptionID);
      
      const result = await createSubscription(data.subscriptionID, plan.id);
      console.log("Subscription creation result:", result);
      
      toast.success(language === 'ar' 
        ? 'تم الاشتراك بنجاح في Gemi PRO!' 
        : 'Successfully subscribed to Gemi PRO!');
        
      setTimeout(() => {
        navigate('/pdfs');
      }, 1500);
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error(language === 'ar'
        ? 'حدث خطأ أثناء معالجة الاشتراك'
        : 'Error processing subscription');
    } finally {
      setProcessingPayment(false);
    }
  };

  // PayPal script options with simple, verified configuration
  const paypalScriptOptions = {
    clientId: "AfJiAZE6-pcu4pzJZT-ICXYuYmgycbWUXcdW-TVeCNciCPIuHBIjy_OcQFqtUxUGN2n1DjHnM4A4u62h",
    intent: "subscription",
    vault: true,
    components: "buttons"
    // Removing dataClientToken which was causing URI malformed errors
  };

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
            {isLoading ? (
              <div className="flex items-center justify-center p-6 border rounded-lg bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="ml-3">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            ) : processingPayment ? (
              <div className="bg-background rounded-lg border p-6 mb-4">
                <div className="flex flex-col items-center justify-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
                  <p className="text-center text-lg font-medium">
                    {language === 'ar' ? 'جاري معالجة الاشتراك...' : 'Processing subscription...'}
                  </p>
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    {language === 'ar' ? 'يرجى الانتظار' : 'Please wait'}
                  </p>
                </div>
              </div>
            ) : plan ? (
              <div className="bg-background rounded-lg border p-4 mb-4">
                <PayPalScriptProvider options={paypalScriptOptions}>
                  <div id="paypal-button-container" className="min-h-[150px]">
                    <PayPalButtons
                      style={{
                        shape: 'rect',
                        color: 'black',
                        layout: 'horizontal',
                        label: 'subscribe'
                      }}
                      createSubscription={(data, actions) => {
                        console.log("Creating subscription with plan ID:", paypalPlanId);
                        return actions.subscription.create({
                          plan_id: paypalPlanId
                        });
                      }}
                      onApprove={(data) => {
                        console.log("PayPal subscription approved:", data);
                        handlePayPalApprove(data);
                        return Promise.resolve();
                      }}
                      onError={(err) => {
                        console.error('PayPal error:', err);
                        setPaypalError(language === 'ar' 
                          ? 'خطأ في PayPal. يرجى المحاولة مرة أخرى لاحقًا.'
                          : 'PayPal error. Please try again later.');
                      }}
                    />
                  </div>
                  {paypalError && (
                    <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300 text-sm">
                      {paypalError}
                    </div>
                  )}
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300">
                {language === 'ar' 
                  ? 'لم يتم العثور على خطط اشتراك. يرجى المحاولة مرة أخرى لاحقًا.'
                  : 'No subscription plans found. Please try again later.'}
              </div>
            )}
            
            <p className="text-sm text-center text-muted-foreground mt-3">
              {language === 'ar' 
                ? 'يمكنك الإلغاء في أي وقت. لا توجد رسوم إضافية.'
                : 'Cancel anytime. No hidden fees.'}
            </p>
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
