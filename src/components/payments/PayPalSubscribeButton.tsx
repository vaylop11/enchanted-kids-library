import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';

interface PayPalSubscribeButtonProps {
  planId: string;
  paypalPlanId: string;
  onSuccess?: () => void;
}

const PayPalSubscribeButton: React.FC<PayPalSubscribeButtonProps> = ({ 
  planId, 
  paypalPlanId,
  onSuccess 
}) => {
  const { language } = useLanguage();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch PayPal client ID from edge function
  useEffect(() => {
    fetchPayPalConfig();
  }, [language]);

  const fetchPayPalConfig = async () => {
    try {
      setHasError(false);
      setIsLoading(true);
      setLoadTimeout(false);
      console.log('Fetching PayPal config...');
      
      // Set timeout for config fetching
      timeoutRef.current = setTimeout(() => {
        console.warn('PayPal config fetch timeout');
        setLoadTimeout(true);
        setHasError(true);
        setIsLoading(false);
      }, 10000); // 10 seconds
      
      const { data, error } = await supabase.functions.invoke('get-paypal-config');
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (error) {
        console.error('PayPal config error:', error);
        throw error;
      }
      
      if (!data?.clientId) {
        throw new Error('Client ID not returned from server');
      }
      
      console.log('PayPal client ID received');
      setClientId(data.clientId);
    } catch (error) {
      console.error('Error fetching PayPal config:', error);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setHasError(true);
      setIsLoading(false);
      toast.error(
        language === 'ar'
          ? 'خطأ في تحميل إعدادات الدفع. الرجاء المحاولة مرة أخرى.'
          : 'Error loading payment settings. Please try again.'
      );
    }
  };

  // Load PayPal SDK and render button
  useEffect(() => {
    if (!clientId || !paypalRef.current) return;

    const loadPayPalSDK = () => {
      console.log('Loading PayPal SDK...');
      
      // Check if SDK is already loaded
      if (document.querySelector('#paypal-sdk')) {
        console.log('PayPal SDK already loaded');
        renderPayPalButton();
        return;
      }

      // Set timeout for SDK loading
      const sdkTimeout = setTimeout(() => {
        console.warn('PayPal SDK load timeout');
        setLoadTimeout(true);
        setHasError(true);
        setIsLoading(false);
      }, 15000); // 15 seconds for SDK

      // Load PayPal SDK
      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&components=buttons&vault=true&intent=subscription`;
      script.async = true;
      script.onload = () => {
        clearTimeout(sdkTimeout);
        console.log('PayPal SDK loaded successfully');
        renderPayPalButton();
      };
      script.onerror = () => {
        clearTimeout(sdkTimeout);
        console.error('Failed to load PayPal SDK');
        toast.error(
          language === 'ar'
            ? 'فشل تحميل نظام الدفع'
            : 'Failed to load payment system'
        );
        setHasError(true);
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    const renderPayPalButton = () => {
      if (!window.paypal || !paypalRef.current) {
        setIsLoading(false);
        console.error('PayPal SDK not available');
        toast.error(
          language === 'ar'
            ? 'فشل تحميل نظام الدفع'
            : 'Failed to load payment system'
        );
        return;
      }

      setIsLoading(false);

      window.paypal.Buttons({
        style: {
          shape: 'rect',
          color: 'gold',
          layout: 'vertical',
          label: 'subscribe',
          height: 45
        },
        createSubscription: function(data: any, actions: any) {
          console.log('Creating PayPal subscription...');
          return actions.subscription.create({
            plan_id: paypalPlanId
          });
        },
        onApprove: async function(data: any) {
          console.log('Subscription approved:', data.subscriptionID);
          setIsProcessing(true);
          
          try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              throw new Error('No active session');
            }

            // Verify and store subscription via edge function
            const { data: result, error } = await supabase.functions.invoke(
              'verify-and-store-subscription',
              {
                body: { subscriptionId: data.subscriptionID },
                headers: {
                  Authorization: `Bearer ${session.access_token}`
                }
              }
            );

            console.log('Verification response:', error ? 'Error' : 'Success');

            if (error) throw error;

            toast.success(
              language === 'ar' 
                ? '🎉 تم تفعيل اشتراك Gemi PRO بنجاح!' 
                : '🎉 Gemi PRO subscription activated successfully!'
            );

            // Call success callback
            if (onSuccess) {
              console.log('Calling onSuccess callback');
              onSuccess();
            } else {
              // Reload page to update UI if no callback
              console.log('Reloading page to update UI');
              setTimeout(() => window.location.reload(), 1500);
            }
            
          } catch (error) {
            console.error('Error processing subscription:', error);
            toast.error(
              language === 'ar'
                ? 'حدث خطأ في معالجة الاشتراك'
                : 'Error processing subscription'
            );
          } finally {
            setIsProcessing(false);
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
    };

    loadPayPalSDK();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [clientId, paypalPlanId, planId, language, onSuccess]);

  if (hasError) {
    return (
      <div className="space-y-2">
        <button
          onClick={fetchPayPalConfig}
          className="w-full h-11 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
        </button>
        <div className="text-xs text-center text-destructive">
          {loadTimeout
            ? (language === 'ar' 
                ? 'انتهت مهلة التحميل. انقر لإعادة المحاولة.'
                : 'Loading timeout. Click to retry.')
            : (language === 'ar' 
                ? 'فشل تحميل نظام الدفع. انقر لإعادة المحاولة.'
                : 'Failed to load payment system. Click to retry.')
          }
        </div>
      </div>
    );
  }

  if (!clientId || isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="text-xs text-center text-muted-foreground">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 text-sm">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
        <span>{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
      </div>
    );
  }

  return (
    <div ref={paypalRef} className="min-h-[45px]" />
  );
};

// Extend window type for PayPal
declare global {
  interface Window {
    paypal?: any;
  }
}

export default PayPalSubscribeButton;
