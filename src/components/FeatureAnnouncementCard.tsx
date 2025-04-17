
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FeatureAnnouncementCardProps {
  className?: string;
}

const FeatureAnnouncementCard: React.FC<FeatureAnnouncementCardProps> = ({ className }) => {
  const { language } = useLanguage();
  
  return (
    <Card className={`overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 ${className}`}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Languages className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div className="flex-1">
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
                {language === 'ar' ? 'جديد' : 'New'}
              </div>
              
              <h3 className="text-lg font-medium mt-2 text-gray-700 dark:text-gray-300">
                {language === 'ar' ? 'ترجمة PDF متاحة الآن!' : 'PDF Translation Now Available!'}
              </h3>
              
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ar' 
                  ? 'ترجم ملفات PDF الخاصة بك إلى أكثر من 20 لغة بنقرة واحدة.' 
                  : 'Translate your PDFs to over 20 languages with just one click.'}
              </p>
              
              <div className="mt-4">
                <Button
                  variant="outline"
                  className="group border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-900 dark:hover:border-purple-800 dark:hover:bg-purple-900/30"
                  asChild
                >
                  <Link to="/translate">
                    {language === 'ar' ? 'جرب الآن' : 'Try it now'} 
                    <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureAnnouncementCard;
