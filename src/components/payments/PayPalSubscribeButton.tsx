import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface PayPalSubscribeButtonProps {
  planId: string;
  paypalPlanId: string;
  onSuccess?: () => void;
}

const PayPalSubscribeButton: React.FC<PayPalSubscribeButtonProps> = ({
  planId,
  paypalPlanId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        if (!paypalPlanId) {
          console.error('❌ paypalPlanId is missing for plan:', planId);
          toast.error('PayPal plan ID غير متوفر');
          setLoading(false);
          return;
        }

        // استدعاء Edge Function من Supabase
        const response = await fetch(
          'https://nknrkkzegbrkqtutmafo.supabase.co/functions/v1/get-paypal-config',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        const clientId = data?.clientId;
        if (!clientId) {
          throw new Error('PayPal clientId غير متوفر');
        }

        const renderButton = () => {
          if (!window.paypal || !paypalRef.current) {
            console.error('PayPal SDK not loaded');
            setLoading(false);
            return;
          }

          // حذف الأزرار القديمة قبل إعادة الرسم
          paypalRef.current.innerHTML = '';

          window.paypal
            .Buttons({
              style: {
                shape: 'rect',
                color: 'gold',
                layout: 'vertical',
                label: 'subscribe',
              },
              createSubscription: (_data: any, actions: any) => {
                return actions.subscription.create({
                  plan_id: paypalPlanId,
                });
              },
              onApprove: async () => {
                toast.success('تم الاشتراك بنجاح');
                onSuccess?.();
              },
              onError: (err: any) => {
                console.error('PayPal error:', err);
                toast.error('حدث خطأ أثناء الاشتراك');
              },
            })
            .render(paypalRef.current);

          setLoading(false);
        };

        // تحميل PayPal SDK مرة واحدة فقط
        if (!window.paypal) {
          const existingScript = document.querySelector<HTMLScriptElement>(
            'script[src*="paypal.com/sdk/js"]'
          );
          if (!existingScript) {
            const script = document.createElement('script');
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
            script.async = true;
            script.onload = renderButton;
            document.body.appendChild(script);
          } else {
            existingScript.onload = renderButton;
          }
        } else {
          renderButton();
        }
      } catch (err) {
        console.error('Error loading PayPal:', err);
        toast.error('فشل تحميل PayPal');
        setLoading(false);
      }
    };

    loadPayPalScript();
  }, [paypalPlanId, planId, onSuccess]);

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center py-3">
          <div className="h-6 w-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div ref={paypalRef}></div>
      )}
    </div>
  );
};

export default PayPalSubscribeButton;
