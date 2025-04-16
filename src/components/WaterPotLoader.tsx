
import { Pot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WaterPotLoaderProps {
  progress?: number;
  className?: string;
}

const WaterPotLoader = ({ progress = 0, className }: WaterPotLoaderProps) => {
  return (
    <div className={cn("relative w-16 h-16 mx-auto", className)}>
      {/* Pot Icon Container */}
      <div className="relative z-10">
        <Pot className="w-16 h-16 text-primary/80" strokeWidth={1.5} />
      </div>
      
      {/* Water Fill Effect */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/40 to-primary/20 rounded-b-full transition-all duration-1000 ease-in-out"
        style={{ 
          height: `${progress}%`,
          maxHeight: '80%', // Don't fill completely to leave space for pot neck
        }}
      >
        {/* Animated Wave Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-x-0 top-0 h-2 animate-[wave_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            style={{ transform: 'translateY(-50%)' }}
          />
        </div>
      </div>
    </div>
  );
};

export default WaterPotLoader;
