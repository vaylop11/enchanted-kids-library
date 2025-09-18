import { FC } from 'react';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';

interface SubscriptionCardProps {
  userId: string;
  plan: any; // بيانات الخطة من useUserPlan
  paypalPlanId: string; // PayPal Plan ID للخطة PRO
  highlighted?: boolean;
}

const SubscriptionCard: FC<SubscriptionCardProps> = ({ userId, plan, paypalPlanId, highlighted = false }) => {
  if (!plan) return <p>Loading plan...</p>;

  const currentPlan = plan.subscription_plans;

  return (
    <div className={`flex flex-col rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-105
      ${highlighted ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>

      <div className={`px-6 py-8 ${highlighted ? 'bg-indigo-500 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
        <p className="text-3xl font-extrabold mb-4">
          {currentPlan.price} {currentPlan.currency} / {currentPlan.interval}
        </p>

        <p className="mb-6">{currentPlan.description}</p>

        {currentPlan.name === 'Free Plan' ? (
<PayPalSubscriptionButton
  currentUser={{ id: userId } as any}
  paypalPlanId={paypalPlanId}
/>

        ) : (
          <button
            className="w-full py-3 rounded-lg font-semibold bg-green-500 text-white"
            disabled
          >
            You are on {currentPlan.name}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
