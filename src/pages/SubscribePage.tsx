
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
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { 
  createSubscription, 
  getSubscriptionPlans, 
  type SubscriptionPlan,
  getPayPalPlanIdFromDatabase 
} from '@/services/subscriptionService';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';

const SubscribePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [paypalPlanId, setPaypalPlanId] = useState<string | null>(null);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const { refreshSubscription } = useSubscription();
  
  // Check for subscription_id in URL params (returned by PayPal)
  const subscriptionId = searchParams.get('subscription_id');
  
  useEffect(() => {
    // Handle PayPal return with subscription_id
    const handlePayPalReturn = async () => {
      if (subscriptionId && plan) {
        try {
          setIsLoading(true);
          toast.info(
            language === 'ar' 
              ? 'جاري التحقق من الاشتراك...' 
              : 'Verifying subscription...'
          );
          
          await createSubscription(subscriptionId, plan.id);
          
          // Refresh subscription status
          refreshSubscription();
          
          toast.success(
            language === 'ar' 
              ? 'تم الاشتراك بنجاح في Gemi PRO!' 
              : 'Successfully subscribed to Gemi PRO!'
          );
          
          navigate('/pdfs');
        } catch (error) {
          console.error('Error processing subscription:', error);
          toast.error(
            language === 'ar'
              ? 'حدث خطأ أثناء معالجة الاشتراك'
              : 'Error processing subscription'
          );
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (subscriptionId) {
      handlePayPalReturn();
    }
  }, [subscriptionId, plan, language, navigate, refreshSubscription]);
  
  useEffect(() => {
    const loadPlan = async () => {
      setIsLoading(true);
      try {
        const plans = await getSubscriptionPlans();
        console.log("Loaded plans:", plans);
        if (plans.length > 0) {
          // Update the plan with the new price
          const updatedPlan = { ...plans[0], price: 4.99 };
          setPlan(updatedPlan);
          
          // Separately fetch PayPal Plan ID to ensure we have it
          const paypalId = await getPayPalPlanIdFromDatabase();
          if (paypalId) {
            setPaypalPlanId(paypalId);
            console.log("Set PayPal Plan ID:", paypalId);
          } else {
            setPaypalError("Missing PayPal plan ID. Please contact support.");
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
  
  React.useEffect(() => {
    if (!user) {
      navigate('/signin?redirect=subscribe');
    }
  }, [user, navigate]);

  const handlePayPalApprove = async (data: any) => {
    if (!plan) return;
    
    try {
      console.log("Subscription approved:", data);
      
      // For PayPal in-page flow (not redirect)
      if (data.subscriptionID) {
        await createSubscription(data.subscriptionID, plan.id);
        toast.success(language === 'ar' 
          ? 'تم الاشتراك بنجاح في Gemi PRO!' 
          : 'Successfully subscribed to Gemi PRO!');
        
        // Refresh subscription status
        refreshSubscription();
        
        navigate('/pdfs');
      }
    } catch (error) {
      console.error('Error processing subscription:', error);
      toast.error(language === 'ar'
        ? 'حدث خطأ أثناء معالجة الاشتراك'
        : 'Error processing subscription');
    }
  };

  const handlePayPalError = (error: Record<string, unknown>) => {
    console.error('PayPal error:', error);
    setPaypalError(language === 'ar' 
      ? 'خطأ في معالجة الدفع. يرجى المحاولة مرة أخرى.' 
      : 'Error processing payment. Please try again.');
    toast.error(language === 'ar' 
      ? 'خطأ في PayPal. يرجى المحاولة مرة أخرى لاحقًا.' 
      : 'PayPal error. Please try again later.');
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
          <div className="order-2 md:order-1">
            {isLoading ? (
              <div className="flex items-center justify-center p-6 border rounded-lg bg-background">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <span className="ml-3">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
              </div>
            ) : plan ? (
              <div className="bg-background rounded-lg border p-4 mb-4">
                <PayPalScriptProvider options={{ 
                  clientId: "AfJiAZE6-pcu4pzJZT-ICXYuYmgycbWUXcdW-TVeCNciCPIuHBIjy_OcQFqtUxUGN2n1DjHnM4A4u62h",
                  vault: true,
                  intent: "subscription",
                  components: "buttons"
                }}>
                  <PayPalButtons
                    createSubscription={(data, actions) => {
                      console.log("Creating subscription with plan ID: P-8AR43998YB6934043M77H5AI");
                      return actions.subscription.create({
                        'plan_id': 'P-8AR43998YB6934043M77H5AI',
                        'application_context': {
                          'user_action': 'SUBSCRIBE_NOW',
                          'return_url': `${window.location.origin}/subscribe?subscription_id={id}`,
                          'cancel_url': `${window.location.origin}/subscribe`
                        }
                      });
                    }}
                    style={{
                      shape: 'rect',
                      color: 'black',
                      layout: 'horizontal',
                      label: 'subscribe'
                    }}
                    onApprove={handlePayPalApprove}
                    onError={(err) => {
                      console.error('PayPal error:', err);
                      toast.error(language === 'ar' 
                        ? 'خطأ في PayPal. يرجى المحاولة مرة أخرى لاحقًا.'
                        : 'PayPal error. Please try again later.');
                    }}
                  />
                </PayPalScriptProvider>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-300">
                {paypalError || (language === 'ar' 
                  ? 'لم يتم العثور على خطط اشتراك. يرجى المحاولة مرة أخرى لاحقًا.'
                  : 'No subscription plans found. Please try again later.')}
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
