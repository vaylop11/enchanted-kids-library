
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowRight, Sparkles, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureAnnouncementCardProps {
  className?: string;
}

const FeatureAnnouncementCard: React.FC<FeatureAnnouncementCardProps> = ({ className }) => {
  const { language } = useLanguage();
  
  return (
    <Card className={`group relative overflow-hidden border-0 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${className}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
      <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-lg group-hover:scale-125 transition-transform duration-500" />
      
      <CardContent className="relative p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl animate-pulse opacity-20" />
                <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <img 
                    src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/translate.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWcvdHJhbnNsYXRlLnBuZyIsImlhdCI6MTc0NDg1MTE4MSwiZXhwIjoxNzc2Mzg3MTgxfQ.JC9V-53lhCHKBoFs_dhp_moE51pxmqjvtHy6wZWcU6c" 
                    alt="Translation" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 border border-purple-200/50 dark:border-purple-800/50">
                    <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400 animate-pulse" />
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                      {language === 'ar' ? 'جديد' : 'NEW'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Globe className="h-4 w-4" />
                    <span className="text-xs">20+ {language === 'ar' ? 'لغة' : 'languages'}</span>
                  </div>
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {language === 'ar' ? 'ترجمة PDF متاحة الآن!' : 'PDF Translation Available!'}
                </h3>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {language === 'ar' 
                    ? 'ترجم ملفات PDF الخاصة بك إلى أكثر من 20 لغة بنقرة واحدة. تقنية ذكية سريعة ودقيقة.' 
                    : 'Translate your PDFs to over 20 languages with one click. Fast, accurate AI-powered translation.'}
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  className="group/btn relative overflow-hidden border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/30 transition-all duration-300"
                  asChild
                >
                  <Link to="/pdfs" className="flex items-center space-x-2">
                    <span className="relative z-10 font-medium">
                      {language === 'ar' ? 'جرب الآن' : 'Try Now'}
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
                  </Link>
                </Button>
                
                <div className="flex items-center space-x-1 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>{language === 'ar' ? 'متوفر الآن' : 'Live now'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[slide-in_2s_infinite]" />
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureAnnouncementCard;
