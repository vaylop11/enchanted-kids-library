
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export const useSubscription = () => {
  const { user, isAdmin } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  // Function to manually refresh subscription status
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
      
      // If admin, they're always subscribed
      if (isAdmin) {
        setIsSubscribed(true);
        setSubscriptionData(data || {
          status: 'ACTIVE',
          current_period_end: new Date(2099, 11, 31).toISOString()
        });
        return;
      }
      
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
    }
  }, [user, isAdmin, language]);

  useEffect(() => {
    refreshSubscription();
  }, [refreshSubscription]);

  return { 
    isSubscribed, 
    subscriptionData, 
    loading, 
    error,
    refreshSubscription 
  };
};
