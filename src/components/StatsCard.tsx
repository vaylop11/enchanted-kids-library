
import React, { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { Loader2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface StatsCardProps {
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ className }) => {
  const { language } = useLanguage();
  const { checkUser } = useAuth();
  
  const { data: userCount, isLoading, error, refetch } = useQuery({
    queryKey: ['userCount'],
    queryFn: async () => {
      console.log('Fetching user count from Edge Function');
      const { data, error } = await supabaseUntyped.functions.invoke('get-user-count');
      
      if (error) {
        console.error('Error fetching user count:', error);
        throw error;
      }
      
      console.log('User count data received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Listen for auth changes to update user count when someone signs in/out
  useEffect(() => {
    const { data: authListener } = supabaseUntyped.auth.onAuthStateChange((event) => {
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
    <Card className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'مجتمع المستخدمين' : 'User Community'}
              </h3>
              
              {isLoading ? (
                <div className="flex items-center mt-2">
                  <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
                  <span className="text-muted-foreground">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </span>
                </div>
              ) : error ? (
                <p className="text-sm text-red-500 mt-1">
                  {language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                </p>
              ) : (
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {userCount?.count || 0}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    {language === 'ar' ? 'مستخدم' : 'users'}
                  </span>
                </p>
              )}
              
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ar' 
                  ? 'انضم إلى مجتمعنا المتنامي' 
                  : 'Join our growing community'}
              </p>
            </div>
            
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
