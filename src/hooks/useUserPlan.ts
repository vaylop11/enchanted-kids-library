import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useUserPlan(userId?: string) {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchPlan() {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          subscription_plans (
            id,
            name,
            description,
            price,
            currency,
            interval
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error(error);
        setPlan(null);
      } else {
        setPlan(data);
      }
      setLoading(false);
    }

    fetchPlan();
  }, [userId]);

  return { plan, loading };
}
