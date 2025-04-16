
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
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }

  return data;
};

export const createSubscription = async (subscriptionId: string, planId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('handle-subscription', {
      body: { subscriptionId, planId }
    });

    if (error) throw error;
    
    toast.success('Successfully subscribed to Gemi PRO!');
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    toast.error('Failed to process subscription');
    throw error;
  }
};
