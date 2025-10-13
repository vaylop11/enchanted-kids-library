import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePDFLimits } from '@/hooks/usePDFLimits';
import { supabase } from '@/integrations/supabase/client';
import PayPalSubscribeButton from './payments/PayPalSubscribeButton';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  paypal_plan_id: string;
}

export default function PlansSection() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { has_paid_subscription, plan_name, refreshLimits } = usePDFLimits();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });

        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscriptionSuccess = async () => {
    await refreshLimits();
  };

  const getPlanFeatures = (planName: string) => {
    if (planName === 'Free') {
      return [
        language === 'ar' ? 'تحميل ملفين PDF فقط' : 'Upload 2 PDFs only',
        language === 'ar' ? 'حجم ملف حتى 5 ميجابايت' : 'File size up to 5MB',
        language === 'ar' ? 'محادثة مع PDF' : 'Chat with PDF',
        language === 'ar' ? 'تحليل أساسي' : 'Basic analysis'
      ];
    } else {
      return [
        language === 'ar' ? 'تحميل غير محدود للملفات' : 'Unlimited PDF uploads',
        language === 'ar' ? 'حجم ملف حتى 50 ميجابايت' : 'File size up to 50MB',
        language === 'ar' ? 'ترجمة متقدمة' : 'Advanced translation',
        language === 'ar' ? 'تحليل عميق بالذكاء الاصطناعي' : 'Deep AI analysis',
        language === 'ar' ? 'دعم أولوية' : 'Priority support'
      ];
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      {plans.map((plan) => {
        const isCurrentPlan = plan.name === plan_name;
        const isPro = plan.name === 'Gemi PRO';
        const isFree = plan.name === 'Free';

        return (
          <Card
            key={plan.id}
            className={`p-8 relative ${
              isPro
                ? 'border-2 border-primary shadow-lg scale-105'
                : 'border border-border'
            }`}
          >
            {isPro && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
              </Badge>
            )}

            {isCurrentPlan && (
              <Badge className="absolute -top-3 right-4 bg-green-500">
                {language === 'ar' ? 'الخطة الحالية' : 'Current Plan'}
              </Badge>
            )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-extrabold mb-2">
                ${plan.price}
                <span className="text-base font-normal text-muted-foreground">
                  /{language === 'ar' ? 'شهر' : 'month'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>

            <ul className="space-y-3 mb-8">
              {getPlanFeatures(plan.name).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {isFree ? (
              <button
                className="w-full py-3 rounded-lg font-semibold bg-muted text-muted-foreground cursor-not-allowed"
                disabled
              >
                {language === 'ar' ? 'الخطة المجانية' : 'Free Plan'}
              </button>
            ) : isCurrentPlan && has_paid_subscription ? (
              <button
                className="w-full py-3 rounded-lg font-semibold bg-green-500 text-white cursor-not-allowed"
                disabled
              >
                {language === 'ar' ? '✓ أنت على هذه الخطة' : '✓ Current Plan'}
              </button>
            ) : (
              user && (
                <PayPalSubscribeButton
                  planId={plan.id}
                  paypalPlanId={plan.paypal_plan_id}
                  onSuccess={handleSubscriptionSuccess}
                />
              )
            )}

            {!user && !isFree && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                {language === 'ar'
                  ? 'يرجى تسجيل الدخول للاشتراك'
                  : 'Please sign in to subscribe'}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
