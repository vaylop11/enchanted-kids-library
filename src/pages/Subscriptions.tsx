import { useAuth } from '@/contexts/AuthContext';
import { useUserPlan } from '@/hooks/useUserPlan';
import SubscriptionCard from '@/components/SubscriptionCard';
import { usePDFLimits } from '@/hooks/usePDFLimits';

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useUserPlan(user?.id);
  const { refreshLimits } = usePDFLimits();

  if (authLoading || planLoading) return <p>Loading...</p>;
  if (!user) return <p>Please log in.</p>;

  const handleSubscriptionSuccess = async () => {
    await refreshLimits();
  };

  return (
    <div className="max-w-lg mx-auto mt-10">
      {plan ? (
        <SubscriptionCard
          userId={user.id}
          plan={plan}
          paypalPlanId="P-0V356102U2698115XNDBPMCQ"
          highlighted={plan?.subscription_plans.name === 'Gemi PRO'}
          onSuccess={handleSubscriptionSuccess}
        />
      ) : (
        // لو المستخدم ما عندوش اشتراك → نعرض Free Plan
        <SubscriptionCard
          userId={user.id}
          plan={{
            status: 'inactive',
            subscription_plans: {
              id: 'free-plan',
              name: 'Free Plan',
              price: 0,
              currency: 'USD',
              interval: 'month',
              description: 'الخطة المجانية تتضمن الاستخدام الأساسي.'
            }
          }}
          paypalPlanId="P-0V356102U2698115XNDBPMCQ"
          highlighted={false}
          onSuccess={handleSubscriptionSuccess}
        />
      )}
    </div>
  );
}
