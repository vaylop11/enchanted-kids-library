
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
    console.log("Manually refreshing subscription status");
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setIsSubscribed(false);
        setSubscriptionData(null);
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
          .maybeSingle();

        if (error) {
          console.error('Error checking subscription:', error);
          setIsSubscribed(false);
          setSubscriptionData(null);
        } else if (data) {
          console.log("Retrieved subscription data:", data);
          
          // Check if the subscription is active and not expired
          const isActive = data && 
                          data.status === 'ACTIVE' && 
                          new Date(data.current_period_end) > new Date();
          
          setIsSubscribed(isActive);
          setSubscriptionData(data);
          
          if (isActive) {
            console.log("User has active subscription until:", new Date(data.current_period_end));
          } else {
            console.log("Subscription found but not active. Status:", data.status, "End date:", new Date(data.current_period_end));
            
            // If subscription exists but is not active, and it has a PayPal ID, try to refresh it
            if (data.paypal_subscription_id && data.status !== 'CANCELLED') {
              try {
                const response = await supabase.functions.invoke('handle-subscription', {
                  body: { 
                    subscriptionId: data.paypal_subscription_id,
                    action: 'refresh'
                  }
                });
                
                if (response.data?.refreshed) {
                  console.log("Successfully refreshed subscription from PayPal");
                  // Re-trigger the check to get the updated data
                  setRefreshTrigger(prev => prev + 1);
                }
              } catch (refreshError) {
                console.error("Failed to auto-refresh subscription:", refreshError);
              }
            }
          }
        } else {
          console.log("No subscription found for user");
          setIsSubscribed(false);
          setSubscriptionData(null);
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
