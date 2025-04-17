
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabaseUntyped } from '@/integrations/supabase/client';
import { Loader2, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatsCardProps {
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ className }) => {
  const { language } = useLanguage();
  
  const { data: userCount, isLoading } = useQuery({
    queryKey: ['userCount'],
    queryFn: async () => {
      const { data, error } = await supabaseUntyped.functions.invoke('get-user-count');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
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
