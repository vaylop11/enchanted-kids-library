
import { useEffect, useState, useCallback } from 'react';
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
  const { user, isAdmin } = useAuth();
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkLimits = useCallback(async () => {
    if (!user) {
      setLimits(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Checking plan limits for user:", user.id);
      
      // If admin, set maximum limits directly without database call
      if (isAdmin) {
        const adminLimits: PlanLimits = {
          has_paid_subscription: true,
          current_pdf_count: 0,  // This will be updated with the actual count
          max_pdfs: 999,         // Unlimited for admin
          max_file_size_mb: 100, // Large limit for admin
          can_translate: true    // All features enabled for admin
        };
        
        // Still need to get the PDF count
        const { count, error: countError } = await supabase
          .from('pdfs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (!countError && count !== null) {
          adminLimits.current_pdf_count = count;
        }
        
        setLimits(adminLimits);
        setLoading(false);
        return;
      }
      
      // For non-admins, use the database function
      const { data, error } = await supabase.rpc('check_user_pdf_limits', {
        user_id: user.id
      });

      if (error) {
        console.error("Error checking plan limits:", error);
        setError(error.message);
        throw error;
      }
      
      // Properly check each property exists and has the correct type before casting
      if (data && 
          typeof data === 'object' && 
          'has_paid_subscription' in data && 
          'current_pdf_count' in data && 
          'max_pdfs' in data && 
          'max_file_size_mb' in data && 
          'can_translate' in data) {
        
        // Create a properly typed object instead of direct casting
        const planLimits: PlanLimits = {
          has_paid_subscription: Boolean(data.has_paid_subscription),
          current_pdf_count: Number(data.current_pdf_count),
          max_pdfs: Number(data.max_pdfs),
          max_file_size_mb: Number(data.max_file_size_mb),
          can_translate: Boolean(data.can_translate)
        };
        
        console.log("Retrieved plan limits:", planLimits);
        setLimits(planLimits);
      } else {
        console.error("Invalid plan limits structure:", data);
        setError('Invalid plan limits data structure returned from server');
        throw new Error('Invalid plan limits data structure returned from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error checking plan limits:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    checkLimits();
  }, [checkLimits]);

  return { 
    limits, 
    loading, 
    error, 
    refreshLimits: checkLimits 
  };
};
