import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Infinity, Upload, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import PayPalSubscribeButton from '@/components/payments/PayPalSubscribeButton';
import { usePDFLimits } from '@/hooks/usePDFLimits';
import { toast } from 'sonner';

const PDFUpgradeCard = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { refreshLimits, has_paid_subscription, plan_name } = usePDFLimits();
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
        .maybeSingle();

      if (error) throw error;
      setSubscriptionPlan(data);
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
    }
  };

  const handleSubscriptionSuccess = async () => {
    // Refresh PDF limits to show unlimited access immediately
    await refreshLimits();
    toast.success(
      language === 'ar'
        ? '🎉 تم تفعيل Gemi PRO! أصبح لديك رفع غير محدود الآن.'
        : '🎉 Gemi PRO activated! You now have unlimited uploads.'
    );
  };

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

  // Don't show upgrade card if user already has paid subscription
  if (!user || has_paid_subscription || plan_name === 'Gemi PRO') {
    return null;
  }

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
          
          {subscriptionPlan && (
            <PayPalSubscribeButton
              planId={subscriptionPlan.id}
              paypalPlanId={subscriptionPlan.paypal_plan_id}
              onSuccess={handleSubscriptionSuccess}
            />
          )}

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

export default PDFUpgradeCard;