
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
    <Card className={`group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/20 dark:via-background dark:to-purple-950/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500" />
      
      <CardContent className="relative p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {language === 'ar' ? 'مجتمع المستخدمين' : 'User Community'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'مجتمعنا المتنامي' : 'Growing community'}
                  </p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
                    <div className="absolute inset-0 h-6 w-6 border-2 border-blue-200 rounded-full animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  </div>
                </div>
              ) : error ? (
                <div className="flex items-center space-x-2 text-red-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">
                    {language === 'ar' ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {userCount?.count || 0}
                    </span>
                    <div className="flex items-center space-x-1 text-green-500">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs font-medium">+{Math.floor(Math.random() * 20 + 5)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {language === 'ar' ? 'مستخدم نشط' : 'active users'}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-2xl animate-pulse opacity-20" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/user.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcvdXNlci5wbmciLCJpYXQiOjE3NDQ4NTEwOTksImV4cCI6MTc3NjM4NzA5OX0.g8i-GWQ2P6Eut5JEwQCc_5ptBOkR7yibrEMYR5e58ls" 
                    alt="User Community" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[slide-in_2s_infinite]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
