import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
interface StatsCardProps {
  className?: string;
}
const StatsCard: React.FC<StatsCardProps> = ({
  className
}) => {
  const {
    language
  } = useLanguage();
  const {
    checkUser
  } = useAuth();
  const {
    data: userCount,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['userCount'],
    queryFn: async () => {
      console.log('Fetching user count from Edge Function');
      const {
        data,
        error
      } = await supabaseUntyped.functions.invoke('get-user-count');
      if (error) {
        console.error('Error fetching user count:', error);
        throw error;
      }
      console.log('User count data received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5,
    // 5 minutes
    refetchOnWindowFocus: false
  });

  // Listen for auth changes to update user count when someone signs in/out
  useEffect(() => {
    const {
      data: authListener
    } = supabaseUntyped.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('Auth state changed, refreshing user count');
        // Wait a moment to ensure the backend has updated
        setTimeout(() => {
          refetch();
        }, 1000);
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [refetch]);
  return;
};
export default StatsCard;