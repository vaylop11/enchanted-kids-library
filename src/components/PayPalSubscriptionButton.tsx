import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface PayPalSubscriptionButtonProps {
  currentUser: User;
  paypalPlanId: string;
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
    if (!gemiProPlanId || !paypalRef.current) return;

    const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    if (!clientId) {
      console.error("❌ PayPal Client ID is missing in .env");
      return;
    }

    const loadPayPal = () => {
      if (window.paypal) {
        window.paypal.Buttons({
          style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
          createSubscription: (_data: any, actions: any) =>
            actions.subscription.create({ plan_id: paypalPlanId }),
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
        }).render(paypalRef.current!);
      }
    };

    if (!document.querySelector("#paypal-sdk")) {
      const script = document.createElement('script');
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
      script.async = true;
      script.onload = loadPayPal;
      document.body.appendChild(script);
    } else {
      loadPayPal();
    }
  }, [paypalPlanId, gemiProPlanId, currentUser.id]);

  return <div ref={paypalRef}>{loading && <p>Processing...</p>}</div>;
};

export default PayPalSubscriptionButton;
