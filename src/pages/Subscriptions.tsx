import { useAuth } from '@/contexts/AuthContext';
import { useUserPlan } from '@/hooks/useUserPlan';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function SubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const { plan, loading: planLoading } = useUserPlan(user?.id);

  if (authLoading || planLoading) return <p>Loading...</p>;
  if (!user) return <p>Please log in.</p>;

  return (
    <div className="max-w-lg mx-auto mt-10">
      <SubscriptionCard
        userId={user.id}
        plan={plan}
        paypalPlanId="P-0V356102U2698115XNDBPMCQ" // PayPal ID الخاص بالخطة PRO
        highlighted={plan?.subscription_plans.name === 'Gemi PRO'}
      />
    </div>
  );
}
