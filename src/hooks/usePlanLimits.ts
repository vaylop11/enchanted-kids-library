
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface PlanLimits {
  has_paid_subscription: boolean;
  current_pdf_count: number;
  max_pdfs: number;
  max_file_size_mb: number;
  can_translate: boolean;
}

export const usePlanLimits = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLimits = async () => {
      if (!user) {
        setLimits(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('check_user_pdf_limits', {
          user_id: user.id
        });

        if (error) throw error;
        setLimits(data as PlanLimits);
      } catch (error) {
        console.error('Error checking plan limits:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLimits();
  }, [user]);

  return { limits, loading };
};
