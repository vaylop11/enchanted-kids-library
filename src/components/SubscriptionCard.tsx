import { FC, useState } from 'react';
import PayPalSubscriptionButton from './PayPalSubscriptionButton';
import type { User } from '@supabase/supabase-js';

interface SubscriptionCardProps {
  title: string;
  price: string;
  features: string[];
  planId?: string; // PayPal plan ID
  gemiProPlanId?: string; // Supabase plan ID
  currentUser?: User;
  highlighted?: boolean;
}

const SubscriptionCard: FC<SubscriptionCardProps> = ({ title, price, features, planId, gemiProPlanId, currentUser, highlighted = false }) => {
  const [isActive, setIsActive] = useState(false); // حالة الاشتراك

  return (
    <div className={`flex flex-col rounded-2xl shadow-lg overflow-hidden border transition-transform hover:scale-105
      ${highlighted ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white'}`}>
      
      <div className={`px-6 py-8 ${highlighted ? 'bg-indigo-500 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-3xl font-extrabold mb-4">{price}</p>
        
        <ul className="mb-6 space-y-2 text-left">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center">
              <span className={`mr-2 ${highlighted ? 'text-white' : 'text-indigo-500'}`}>✓</span> {feature}
            </li>
          ))}
        </ul>

        {isActive ? (
          <button className={`w-full py-3 rounded-lg font-semibold bg-green-500 text-white`} disabled>
            Active Gemi Pro
          </button>
        ) : planId && gemiProPlanId && currentUser ? (
<PayPalSubscriptionButton
  currentUser={currentUser} 
  paypalPlanId="P-0V356102U2698115XNDBPMCQ"
/>

        ) : (
          <button
            className={`w-full py-3 rounded-lg font-semibold ${highlighted ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
            disabled
          >
            Free Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default SubscriptionCard;
