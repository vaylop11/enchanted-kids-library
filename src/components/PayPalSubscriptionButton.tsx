import { useEffect, useRef } from 'react';

interface PayPalSubscriptionButtonProps {
  planId: string;
  onSuccess?: (subscriptionID: string) => void;
}

const PayPalSubscriptionButton: React.FC<PayPalSubscriptionButtonProps> = ({ planId, onSuccess }) => {
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=AfJiAZE6-pcu4pzJZT-ICXYuYmgycbWUXcdW-TVeCNciCPIuHBIjy_OcQFqtUxUGN2n1DjHnM4A4u62h&vault=true&intent=subscription";
    script.async = true;
    script.onload = () => {
      if (window.paypal && paypalRef.current) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          createSubscription: function (data: any, actions: any) {
            return actions.subscription.create({
              plan_id: planId,
            });
          },
          onApprove: function (data: any, actions: any) {
            if (onSuccess) onSuccess(data.subscriptionID);
            alert(`Subscription successful! ID: ${data.subscriptionID}`);
          },
        }).render(paypalRef.current);
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [planId, onSuccess]);

  return <div ref={paypalRef} />;
};

export default PayPalSubscriptionButton;
