import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Infinity, Upload, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PDFUpgradeCard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<any>(null);

  useEffect(() => {
    fetchSubscriptionPlan();
  }, []);

  const fetchSubscriptionPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('name', 'Gemi PRO')
        .single();

      if (error) throw error;
      setSubscriptionPlan(data);
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
    }
  };

  useEffect(() => {
    if (!subscriptionPlan || !paypalRef.current) return;

    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=AfJiAZE6-pcu4pzJZT-ICXYuYmgycbWUXcdW-TVeCNciCPIuHBIjy_OcQFqtUxUGN2n1DjHnM4A4u62h&vault=true&intent=subscription';
    script.async = true;
    
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'blue',
            layout: 'vertical',
            label: 'subscribe',
            height: 45
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: subscriptionPlan.paypal_plan_id
            });
          },
          onApprove: async function(data: any, actions: any) {
            setIsLoading(true);
            try {
              // Save subscription to Supabase
              const { error } = await supabase
                .from('user_subscriptions')
                .insert({
                  user_id: user?.id,
                  plan_id: subscriptionPlan.id,
                  paypal_subscription_id: data.subscriptionID,
                  status: 'ACTIVE',
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                });

              if (error) throw error;

              toast.success(
                language === 'ar' 
                  ? 'تم تفعيل اشتراك Gemini Pro بنجاح!' 
                  : 'Gemini Pro subscription activated successfully!'
              );
              
              // Reload page to update UI
              setTimeout(() => window.location.reload(), 2000);
              
            } catch (error) {
              console.error('Error saving subscription:', error);
              toast.error(
                language === 'ar'
                  ? 'حدث خطأ في حفظ الاشتراك'
                  : 'Error saving subscription'
              );
            } finally {
              setIsLoading(false);
            }
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            toast.error(
              language === 'ar'
                ? 'حدث خطأ في عملية الدفع'
                : 'Payment error occurred'
            );
          }
        }).render(paypalRef.current);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [subscriptionPlan, user, language]);

  const features = [
    {
      icon: <Infinity className="h-5 w-5" />,
      text: language === 'ar' ? 'رفع غير محدود من ملفات PDF' : 'Unlimited PDF uploads'
    },
    {
      icon: <Upload className="h-5 w-5" />,
      text: language === 'ar' ? 'رفع ملفات حتى 50MB' : 'Upload files up to 50MB'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: language === 'ar' ? 'ترجمة متقدمة بالذكاء الاصطناعي' : 'Advanced AI translation'
    },
    {
      icon: <Star className="h-5 w-5" />,
      text: language === 'ar' ? 'دعم أولوية' : 'Priority support'
    }
  ];

  if (!user) return null;

  return (
    <Card className="premium-gradient border-2 border-primary/20 shadow-xl">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="h-6 w-6 text-yellow-500" />
          <CardTitle className="text-2xl font-bold gradient-text">
            {language === 'ar' ? 'Gemini Pro' : 'Gemini Pro'}
          </CardTitle>
          <Star className="h-6 w-6 text-yellow-500" />
        </div>
        <CardDescription className="text-lg">
          {language === 'ar' 
            ? 'أطلق العنان لقوة الذكاء الاصطناعي الكاملة' 
            : 'Unlock the full power of AI'}
        </CardDescription>
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="text-3xl font-bold text-primary">$9.99</span>
          <span className="text-muted-foreground">
            {language === 'ar' ? '/شهر' : '/month'}
          </span>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {language === 'ar' ? 'أفضل قيمة' : 'Best Value'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-shrink-0 p-1 rounded-full bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <span className="text-sm font-medium">{feature.text}</span>
              <Check className="h-4 w-4 text-green-500 ml-auto" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'ادفع بأمان باستخدام PayPal' 
                : 'Pay securely with PayPal'}
            </p>
          </div>
          
          <div 
            ref={paypalRef} 
            className="min-h-[45px] flex items-center justify-center"
          >
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground text-center">
            {language === 'ar' 
              ? 'يمكنك إلغاء الاشتراك في أي وقت من حسابك على PayPal' 
              : 'Cancel anytime from your PayPal account'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

// Extend window type for PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}

export default PDFUpgradeCard;