
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
    return [];
  }

  console.log("Retrieved subscription plans:", data);
  return data;
};

export const createSubscription = async (subscriptionId: string, planId: string) => {
  console.log("Creating subscription with ID:", subscriptionId, "for plan:", planId);
  
  try {
    const { data, error } = await supabase.functions.invoke('handle-subscription', {
      body: { subscriptionId, planId }
    });

    if (error) {
      console.error("Supabase function error:", error);
      throw error;
    }
    
    console.log("Subscription created successfully:", data);
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const getPayPalPlanIdFromDatabase = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('paypal_plan_id')
      .single();
    
    if (error) {
      console.error('Error fetching PayPal plan ID:', error);
      return null;
    }
    
    console.log("Retrieved PayPal plan ID:", data?.paypal_plan_id);
    return data?.paypal_plan_id || null;
  } catch (error) {
    console.error('Error retrieving PayPal plan ID:', error);
    return null;
  }
};
