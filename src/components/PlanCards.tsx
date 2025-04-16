
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { FreePlanCard } from '@/components/FreePlanCard';
import ProSubscriptionCard from '@/components/ProSubscriptionCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const PlanCards = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { language, direction } = useLanguage();

  // Reset carousel position when language changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [language]);

  // Handle navigation based on language direction
  const navigateNext = () => {
    setCurrentSlide(currentSlide === 0 ? 1 : 0);
  };

  const navigatePrevious = () => {
    setCurrentSlide(currentSlide === 0 ? 1 : 0);
  };

  // Determine which buttons to use based on direction
  const LeftButton = direction === 'rtl' ? ChevronRight : ChevronLeft;
  const RightButton = direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className="relative max-w-md mx-auto">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
        dir={direction}
        setApi={(api) => {
          api?.on('select', () => {
            setCurrentSlide(api.selectedScrollSnap());
          });
        }}
      >
        <CarouselContent>
          <CarouselItem>
            <FreePlanCard />
          </CarouselItem>
          <CarouselItem>
            <ProSubscriptionCard />
          </CarouselItem>
        </CarouselContent>

        <div className="absolute -left-12 right-0 top-1/2 flex -translate-y-1/2 justify-between">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-background shadow-sm"
            onClick={navigatePrevious}
            aria-label={language === 'ar' ? 'السابق' : 'Previous'}
          >
            <LeftButton className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-background shadow-sm"
            onClick={navigateNext}
            aria-label={language === 'ar' ? 'التالي' : 'Next'}
          >
            <RightButton className="h-4 w-4" />
          </Button>
        </div>
      </Carousel>
      
      <div className="mt-4 flex justify-center gap-2">
        <div 
          className={`h-2 w-2 rounded-full transition-colors ${
            currentSlide === 0 ? 'bg-primary' : 'bg-muted'
          }`} 
        />
        <div 
          className={`h-2 w-2 rounded-full transition-colors ${
            currentSlide === 1 ? 'bg-primary' : 'bg-muted'
          }`} 
        />
      </div>
    </div>
  );
};
