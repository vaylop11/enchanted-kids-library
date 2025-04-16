
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSubscription = () => {
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually refresh subscription status
  const refreshSubscription = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      try {
        console.log("Checking subscription for user:", user.id);
        
        // Get the most recent subscription
        const { data, error } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Error checking subscription:', error);
          setIsSubscribed(false);
          setSubscriptionData(null);
        } else {
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
          }
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        setIsSubscribed(false);
        setSubscriptionData(null);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user, refreshTrigger]);

  return { isSubscribed, subscriptionData, loading, refreshSubscription };
};
