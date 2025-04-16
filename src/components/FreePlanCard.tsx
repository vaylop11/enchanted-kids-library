
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, X, Zap } from 'lucide-react';

export const FreePlanCard = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 border-2 hover:border-primary/20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 z-0" />
      <CardContent className="p-6 relative z-10">
        <div className="flex flex-col gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Zap className="h-3 w-3" />
              {language === 'ar' ? 'مجاني' : 'Free'}
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              {language === 'ar' ? 'جيمي المجاني' : 'Gemi Free'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'ابدأ باستخدام جيمي مجانًا'
                : 'Get started with Gemi for free'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
              <FileText className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'الحد الأقصى للملفات: 2 PDF'
                    : 'Max PDFs: 2 files'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? '2/2 ملفات مستخدمة'
                    : '2/2 files used'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
              <FileText className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'حجم الملف: 5 ميجابايت كحد أقصى'
                    : 'File size: Up to 5MB'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'لكل ملف PDF'
                    : 'Per PDF file'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-destructive/10 p-3 rounded-lg">
              <X className="h-5 w-5 mt-0.5 text-destructive" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'لا يوجد ترجمة'
                    : 'No Translation'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'متوفر في خطة Pro فقط'
                    : 'Available in Pro plan only'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-muted/50 p-3 rounded-lg">
              <Zap className="h-5 w-5 mt-0.5 text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {language === 'ar'
                    ? 'سرعة معالجة عادية'
                    : 'Normal processing speed'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar'
                    ? 'سرعة معالجة قياسية'
                    : 'Standard processing speed'}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/subscribe')}
            variant="outline"
            className="mt-4 w-full"
          >
            {language === 'ar' ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
