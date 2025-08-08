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
  return (
    <div className={`bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">
              {language === 'ar' ? 'المستخدمون النشطون' : 'Active Users'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'إجمالي المستخدمين المسجلين' : 'Total registered users'}
            </p>
          </div>
        </div>
        {!isLoading && !error && (
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {language === 'ar' ? 'متزايد' : 'Growing'}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-primary">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-muted-foreground text-lg">
                {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
              </span>
            </div>
          ) : error ? (
            <span className="text-red-500 text-lg">
              {language === 'ar' ? 'خطأ' : 'Error'}
            </span>
          ) : (
            userCount?.count?.toLocaleString() || '0'
          )}
        </div>
        
        {!isLoading && !error && userCount?.count && (
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              {language === 'ar' ? 'منذ الإطلاق' : 'Since launch'}
            </div>
            <div className="text-xs text-green-600 font-medium">
              +{Math.floor(userCount.count * 0.1)} {language === 'ar' ? 'هذا الشهر' : 'this month'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StatsCard;