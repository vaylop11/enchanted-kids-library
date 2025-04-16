
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanCards } from '@/components/PlanCards';
import { useEffect } from 'react';

export const PlanInfo = () => {
  const { limits, loading, refreshLimits } = usePlanLimits();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  // Ensure plan info gets refreshed when language changes
  useEffect(() => {
    refreshLimits();
  }, [language, refreshLimits]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!limits) {
    return <PlanCards />;
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              {limits.has_paid_subscription 
                ? (language === 'ar' ? 'خطة Pro' : 'Pro Plan')
                : (language === 'ar' ? 'جيمي المجاني' : 'Gemi Free')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'ar'
                ? `${limits.current_pdf_count}/${limits.max_pdfs} ملفات PDF المستخدمة`
                : `${limits.current_pdf_count}/${limits.max_pdfs} PDFs used`}
            </p>
          </div>
          
          {!limits.has_paid_subscription && (
            <Button
              onClick={() => navigate('/subscribe')}
              variant="default"
              className="bg-purple-800 text-white hover:bg-purple-900"
            >
              {language === 'ar' ? 'ترقية إلى Pro' : 'Upgrade to Pro'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
