
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalendarDays, CreditCard, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { manuallyRefreshSubscription } from '@/services/subscriptionService';
import { useState } from 'react';

export const SubscriptionManagement = () => {
  const { isSubscribed, subscriptionData, loading, refreshSubscription } = useSubscription();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (!subscriptionData?.paypal_subscription_id) {
      refreshSubscription();
      return;
    }
    
    setRefreshing(true);
    try {
      await manuallyRefreshSubscription(subscriptionData.paypal_subscription_id);
      refreshSubscription();
      toast.success(
        language === 'ar' 
          ? 'تم تحديث حالة الاشتراك' 
          : 'Subscription status refreshed'
      );
    } catch (error) {
      console.error("Error manually refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'ar' ? 'حالة الاشتراك' : 'Subscription Status'}
        </CardTitle>
        <CardDescription>
          {isSubscribed 
            ? (language === 'ar' ? 'أنت مشترك حالياً في Gemi PRO' : 'You are currently subscribed to Gemi PRO')
            : (language === 'ar' ? 'ليس لديك اشتراك نشط' : 'You don\'t have an active subscription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubscribed && subscriptionData ? (
          <>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {language === 'ar' ? 'تاريخ التجديد' : 'Next Renewal'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(subscriptionData.current_period_end), 'PPP')}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {subscriptionData.status === 'ACTIVE' 
                    ? (language === 'ar' ? 'نشط' : 'Active')
                    : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                </p>
              </div>
            </div>
          </>
        ) : (
          <Button 
            onClick={() => navigate('/subscribe')} 
            className="w-full"
          >
            {language === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}
          </Button>
        )}
      </CardContent>
      {subscriptionData && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            disabled={refreshing}
            onClick={handleManualRefresh}
            className="flex items-center gap-2 ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {language === 'ar' ? 'تحديث الحالة' : 'Refresh Status'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
