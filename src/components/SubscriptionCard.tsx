import { FC } from 'react';
import PayPalSubscribeButton from './payments/PayPalSubscribeButton';
import { useLanguage } from '@/contexts/LanguageContext';

interface SubscriptionCardProps {
  userId: string;
  plan: any; // بيانات الخطة من useUserPlan
  paypalPlanId: string; // PayPal Plan ID للخطة PRO
  highlighted?: boolean;
  onSuccess?: () => void;
}

const SubscriptionCard: FC<SubscriptionCardProps> = ({ userId, plan, paypalPlanId, highlighted = false, onSuccess }) => {
  const { language } = useLanguage();
  
  if (!plan) return <p>{language === 'ar' ? 'جاري التحميل...' : 'Loading plan...'}</p>;

  const currentPlan = plan.subscription_plans;
  const isActive = plan.status === 'ACTIVE';
  const isPro = currentPlan.name === 'Gemi PRO';

  return (
    <div className={`flex flex-col rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-105
      ${highlighted ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>

      <div className={`px-6 py-8 ${highlighted ? 'bg-indigo-500 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-2xl font-bold mb-2">{currentPlan.name}</h3>
        <p className="text-3xl font-extrabold mb-4">
          {currentPlan.price} {currentPlan.currency} / {currentPlan.interval}
        </p>

        <p className="mb-6">{currentPlan.description}</p>

        {!isActive || !isPro ? (
          <PayPalSubscribeButton
            planId={currentPlan.id}
            paypalPlanId={paypalPlanId}
            onSuccess={onSuccess}
          />
        ) : (
          <button
            className="w-full py-3 rounded-lg font-semibold bg-green-500 text-white cursor-not-allowed"
            disabled
          >
            {language === 'ar' ? `أنت على خطة ${currentPlan.name} ✓` : `You are on ${currentPlan.name} ✓`}
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
