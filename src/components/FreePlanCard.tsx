
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, X } from 'lucide-react';

export const FreePlanCard = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-2xl font-semibold mb-2">
              {language === 'ar' ? 'جيمي المجاني' : 'Gemi Free'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'ابدأ باستخدام جيمي مجانًا'
                : 'Get started with Gemi for free'}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
              <p className="text-sm">
                {language === 'ar'
                  ? 'الحد الأقصى للملفات: 2 PDF'
                  : 'Max PDFs: 2 files'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
              <p className="text-sm">
                {language === 'ar'
                  ? 'حجم الملف: 5 ميجابايت كحد أقصى'
                  : 'File size: Up to 5MB'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <X className="h-4 w-4 mt-1 text-red-500" />
              <p className="text-sm text-muted-foreground">
                {language === 'ar'
                  ? 'لا يوجد ترجمة'
                  : 'No Translation'}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 mt-1 text-muted-foreground" />
              <p className="text-sm">
                {language === 'ar'
                  ? 'سرعة معالجة عادية'
                  : 'Normal processing speed'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => navigate('/subscribe')}
            variant="outline"
            className="mt-4"
          >
            {language === 'ar' ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
