import { useUser } from '@supabase/auth-helpers-react';
import { useUserPlan } from '@/hooks/useUserPlan';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function SubscriptionsPage() {
  const user = useUser();
  const { plan, loading } = useUserPlan(user?.id);

  if (!user) return <p>Please log in.</p>;
  if (loading) return <p>Loading...</p>;

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
