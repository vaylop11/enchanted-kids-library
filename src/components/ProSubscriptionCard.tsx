
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProSubscriptionCard = () => {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isSubscribePage = location.pathname === '/subscribe';
  const [key, setKey] = useState(Date.now()); // Add key state for forced re-render

  // Force re-render when language changes to ensure all translations are applied correctly
  useEffect(() => {
    setKey(Date.now());
  }, [language]);

  return (
    <Card 
      key={key} 
      className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/5 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/10 z-0" />
      <CardContent className={`p-6 relative z-10 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
        <div className="flex flex-col gap-4">
          <div className={`${direction === 'rtl' ? 'mr-0' : ''}`}>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-medium mb-4 ${direction === 'rtl' ? 'flex-row-reverse' : ''}`}>
              <Zap className="h-3 w-3" />
              {language === 'ar' ? 'جيمي برو' : 'Gemi Pro'}
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              $4.99 <span className="text-sm text-muted-foreground font-normal">/mo</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'احصل على جميع الميزات المتقدمة'
                : 'Get access to all advanced features'}
            </p>
          </div>

          <div className="space-y-4">
            <div className={`flex items-start gap-3 bg-purple-500/10 p-3 rounded-lg ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
              <FileText className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'الحد الأقصى للملفات: 10 PDF'
                    : 'Max PDFs: 10 files'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'خمسة أضعاف السعة المجانية'
                    : '5x the free capacity'}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 bg-purple-500/10 p-3 rounded-lg ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
              <FileText className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'حجم الملف: حتى 20 ميجابايت'
                    : 'File size: Up to 20MB'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'لكل ملف PDF'
                    : 'Per PDF file'}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 bg-purple-500/10 p-3 rounded-lg ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
              <Globe className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'الترجمة'
                    : 'Translation'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'متوفر'
                    : 'Available'}
                </p>
              </div>
            </div>

            <div className={`flex items-start gap-3 bg-purple-500/10 p-3 rounded-lg ${direction === 'rtl' ? 'flex-row-reverse text-right' : ''}`}>
              <Zap className="h-5 w-5 mt-0.5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'سرعة معالجة فائقة'
                    : 'Fast processing speed'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'معالجة أسرع للملفات'
                    : 'Faster file processing'}
                </p>
              </div>
            </div>
          </div>

          {!isSubscribePage && (
            <Button
              onClick={() => navigate('/subscribe')}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white ${direction === 'rtl' ? 'font-[system-ui]' : ''}`}
            >
              {language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProSubscriptionCard;
