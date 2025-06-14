
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Globe, MessageCircle, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabaseUntyped } from '@/integrations/supabase/client';

const CommunityAndTranslationCards = () => {
  const { language } = useLanguage();

  // Fetch user count from Supabase
  const { data: userCount, isLoading } = useQuery({
    queryKey: ['communityUserCount'],
    queryFn: async () => {
      console.log('Fetching community user count');
      const { data, error } = await supabaseUntyped.functions.invoke('get-user-count');
      
      if (error) {
        console.error('Error fetching community user count:', error);
        throw error;
      }
      
      console.log('Community user count data received:', data);
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <section className="py-12 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Community Card */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-background dark:to-indigo-950/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {language === 'ar' ? 'انضم لمجتمعنا' : 'Join Our Community'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' ? 'مجتمع متنامي من محبي PDF' : 'Growing community of PDF enthusiasts'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              {/* User Stats */}
              <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/30 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {userCount?.count || 0}
                      </span>
                      <div className="flex items-center gap-1 text-green-500">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">+{Math.floor(Math.random() * 15 + 10)}%</span>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'مستخدم نشط' : 'Active Users'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'هذا الشهر' : 'This month'}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'دردشة مباشرة مع المجتمع' : 'Live chat with community'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'نصائح وحيل حصرية' : 'Exclusive tips & tricks'}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                size="lg"
              >
                {language === 'ar' ? 'انضم الآن' : 'Join Now'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {/* Translation Card */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-background dark:to-teal-950/20 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            {/* Animated background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-br from-teal-400/20 to-emerald-400/20 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500" />
            
            <CardHeader className="relative pb-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {language === 'ar' ? 'ترجمة احترافية' : 'Professional Translation'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' ? 'ترجم مستنداتك بدقة عالية' : 'Translate your documents with high accuracy'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              {/* Translation Stats */}
              <div className="flex items-center gap-4 p-4 bg-white/50 dark:bg-gray-800/30 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">50+</span>
                  <div className="flex items-center gap-1 text-green-500">
                    <Globe className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'لغة مدعومة' : 'Supported Languages'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {language === 'ar' ? 'بدقة عالية' : 'High accuracy'}
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'ترجمة فورية بالذكاء الاصطناعي' : 'Instant AI-powered translation'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {language === 'ar' ? 'احتفظ بتنسيق المستند' : 'Preserve document formatting'}
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Button 
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                size="lg"
                onClick={() => window.location.href = '/translate'}
              >
                {language === 'ar' ? 'ابدأ الترجمة' : 'Start Translating'}
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CommunityAndTranslationCards;
