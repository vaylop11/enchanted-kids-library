
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export const useSubscription = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const refreshSubscription = useCallback(async () => {
    if (!user) {
      setIsSubscribed(false);
      setSubscriptionData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Checking subscription for user:", user.id);
      
      // Get the most recent subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'ACTIVE')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) {
        console.error('Error checking subscription:', error);
        setError(error.message);
        setIsSubscribed(false);
        setSubscriptionData(null);
        return;
      }
      
      console.log("Retrieved subscription data:", data);
      
      // Check if the subscription is active and not expired
      const isActive = data && 
                      data.status === 'ACTIVE' && 
                      new Date(data.current_period_end) > new Date();
      
      setIsSubscribed(isActive);
      setSubscriptionData(data);
      
      if (isActive) {
        console.log("User has active subscription until:", new Date(data.current_period_end));
      } else if (data) {
        console.log("Subscription found but not active. Status:", data.status, "End date:", new Date(data.current_period_end));
        
        // If subscription exists but shows as expired, try to refresh from PayPal
        if (data.paypal_subscription_id && data.paypal_subscription_id !== 'ADMIN_PERMANENT') {
          try {
            console.log("Attempting to refresh potentially expired subscription from PayPal");
            await supabase.functions.invoke('handle-subscription', {
              body: { 
                subscriptionId: data.paypal_subscription_id,
                action: 'refresh'
              }
            });
            
            // Check again after refresh
            const { data: refreshedData } = await supabase
              .from('user_subscriptions')
              .select('*')
              .eq('id', data.id)
              .single();
              
            if (refreshedData && 
                refreshedData.status === 'ACTIVE' && 
                new Date(refreshedData.current_period_end) > new Date()) {
              console.log("Subscription was refreshed and is now active");
              setIsSubscribed(true);
              setSubscriptionData(refreshedData);
            }
          } catch (refreshError) {
            console.error("Error refreshing subscription:", refreshError);
          }
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error checking subscription:', errorMessage);
      setError(errorMessage);
      setIsSubscribed(false);
      setSubscriptionData(null);
      toast.error(language === 'ar' 
        ? 'حدث خطأ أثناء التحقق من الاشتراك'  
        : 'Error checking subscription status');
    } finally {
      setLoading(false);
      setLastRefresh(Date.now());
    }
  }, [user, language]);

  // Refresh on mount and when dependencies change
  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);
  
  // Add a periodic refresh every 60 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      refreshSubscription();
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  return { 
    isSubscribed, 
    subscriptionData, 
    loading, 
    error,
    refreshSubscription,
    lastRefresh
  };
};
