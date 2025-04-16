
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { CalendarDays, CreditCard, RefreshCw, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { manuallyRefreshSubscription } from '@/services/subscriptionService';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const SubscriptionManagement = () => {
  const { isSubscribed, subscriptionData, loading, error, refreshSubscription } = useSubscription();
  const { language } = useLanguage();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  
  // Ensure subscription data refreshes when language changes
  useEffect(() => {
    refreshSubscription();
  }, [language, refreshSubscription]);

  const handleManualRefresh = async () => {
    if (!subscriptionData?.paypal_subscription_id || subscriptionData.paypal_subscription_id === 'ADMIN_PERMANENT') {
      refreshSubscription();
      return;
    }
    
    setRefreshing(true);
    try {
      await manuallyRefreshSubscription(subscriptionData.paypal_subscription_id);
      await refreshSubscription();
      toast.success(
        language === 'ar' 
          ? 'تم تحديث حالة الاشتراك' 
          : 'Subscription status refreshed'
      );
    } catch (error) {
      console.error("Error manually refreshing:", error);
      toast.error(
        language === 'ar'
          ? 'فشل تحديث حالة الاشتراك'
          : 'Failed to refresh subscription status'
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="ml-3">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            {language === 'ar' ? 'خطأ في الاشتراك' : 'Subscription Error'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            className="mt-4"
          >
            {language === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    );
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
                  {subscriptionData.paypal_subscription_id === 'ADMIN_PERMANENT' 
                    ? (language === 'ar' ? 'اشتراك دائم' : 'Permanent Subscription')
                    : format(new Date(subscriptionData.current_period_end), 'PPP')}
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
            {isAdmin && (
              <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {language === 'ar' 
                    ? 'امتيازات المشرف: يمكنك استخدام ميزة الترجمة' 
                    : 'Admin privileges: You can use translation feature'}
                </p>
              </div>
            )}
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
      {(isSubscribed || error) && (
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
