// components/SubscriptionCard.tsx
import { FC } from 'react';
import { Button } from '@/components/ui/button';

interface SubscriptionCardProps {
  title: string;
  price: string;
  features: string[];
  paypalLink: string;
  highlighted?: boolean; // For featured subscription
}

const SubscriptionCard: FC<SubscriptionCardProps> = ({ title, price, features, paypalLink, highlighted = false }) => {
  return (
    <div className={`flex flex-col rounded-2xl shadow-lg overflow-hidden border ${highlighted ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'} transition-transform hover:scale-105`}>
      <div className={`px-6 py-8 ${highlighted ? 'bg-indigo-500 text-white' : 'bg-white text-gray-900'}`}>
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-3xl font-extrabold mb-4">{price}</p>
        <ul className="mb-6 space-y-2">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-center">
              <span className={`mr-2 ${highlighted ? 'text-white' : 'text-indigo-500'}`}>✓</span> {feature}
            </li>
          ))}
        </ul>
        <Button
          className={`w-full ${highlighted ? 'bg-white text-indigo-600 hover:bg-gray-100' : 'bg-indigo-500 text-white hover:bg-indigo-600'}`}
          onClick={() => window.location.href = paypalLink}
        >
          Subscribe
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionCard;
