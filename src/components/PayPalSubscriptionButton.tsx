import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface PayPalSubscriptionButtonProps {
  currentUser: User;
  paypalPlanId: string; // PayPal plan ID (من جدول subscription_plans)
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({ currentUser, paypalPlanId }) => {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [gemiProPlanId, setGemiProPlanId] = useState<string | null>(null);

  // 🔹 جلب UUID الخاص بالخطة من Supabase
  useEffect(() => {
    const fetchPlan = async () => {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('paypal_plan_id', paypalPlanId)
        .single();

      if (error) {
        console.error('Error fetching plan:', error);
      } else {
        setGemiProPlanId(data.id);
      }
    };
    fetchPlan();
  }, [paypalPlanId]);

  useEffect(() => {
    if (!gemiProPlanId) return;

    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AfJiAZE6-pcu4pzJZT-ICXYuYmgycbWUXcdW-TVeCNciCPIuHBIjy_OcQFqtUxUGN2n1DjHnM4A4u62h&vault=true&intent=subscription";
    script.async = true;

    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
          createSubscription: (data: any, actions: any) => actions.subscription.create({ plan_id: paypalPlanId }),
          onApprove: async (data: any) => {
            setLoading(true);
            try {
              const subscriptionID = data.subscriptionID;
              const { error } = await supabase
                .from('user_subscriptions')
                .insert([{
                  user_id: currentUser.id,
                  plan_id: gemiProPlanId,
                  paypal_subscription_id: subscriptionID,
                  status: 'ACTIVE',
                  current_period_start: new Date(),
                  current_period_end: new Date(new Date().setMonth(new Date().getMonth() + 1))
                }]);

              if (error) throw error;

              alert('✅ تم تفعيل Gemi Pro بنجاح!');
            } catch (err) {
              console.error('Error creating subscription:', err);
              alert('❌ حدث خطأ أثناء تفعيل الاشتراك.');
            } finally {
              setLoading(false);
            }
          }
        }).render(paypalRef.current);
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [paypalPlanId, gemiProPlanId, currentUser.id]);

  return <div ref={paypalRef}>{loading && <p>Processing...</p>}</div>;
};

export default PayPalSubscriptionButton;
