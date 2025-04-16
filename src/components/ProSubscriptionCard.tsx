import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Zap, Globe } from 'lucide-react';

const ProSubscriptionCard = () => {
  const { language } = useLanguage();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-900/5 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/5 z-0" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-xs font-medium mb-4">
              <Zap className="h-3 w-3" />
              {language === 'ar' ? 'جيمي برو' : 'Gemi Pro'}
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              $9.99 <span className="text-sm text-muted-foreground font-normal">/mo</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'احصل على جميع الميزات المتقدمة'
                : 'Get access to all advanced features'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-purple-500/5 p-3 rounded-lg">
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

            <div className="flex items-start gap-3 bg-purple-500/5 p-3 rounded-lg">
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

            <div className="flex items-start gap-3 bg-purple-500/5 p-3 rounded-lg">
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

            <div className="flex items-start gap-3 bg-purple-500/5 p-3 rounded-lg">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProSubscriptionCard;
