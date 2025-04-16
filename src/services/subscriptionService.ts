
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  interval: string;
  paypal_plan_id: string;
}

export const getSubscriptionPlans = async (): Promise<SubscriptionPlan[]> => {
  console.log("Fetching subscription plans...");
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    toast.error('Failed to fetch subscription plans');
    return [];
  }

  console.log("Retrieved subscription plans:", data);
  return data;
};

export const createSubscription = async (subscriptionId: string, planId: string) => {
  console.log("Creating subscription with ID:", subscriptionId, "for plan:", planId);
  
  try {
    const { data, error } = await supabase.functions.invoke('handle-subscription', {
      body: { 
        subscriptionId,
        planId,
        paypalPlanId: 'P-8AR43998YB6934043M77H5AI' // Using the specific PayPal plan ID
      }
    });

    if (error) {
      console.error("Supabase function error:", error);
      toast.error('Failed to create subscription');
      throw error;
    }
    
    console.log("Subscription created successfully:", data);
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    toast.error('Error creating subscription');
    throw error;
  }
};

export const getPayPalPlanIdFromDatabase = async (): Promise<string> => {
  // Always return the specific PayPal plan ID
  return 'P-8AR43998YB6934043M77H5AI';
};
