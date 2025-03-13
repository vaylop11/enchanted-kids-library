
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Story } from '@/data/stories';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface StoryCardProps {
  story: Story;
  index: number;
}

const StoryCard = ({ story, index }: StoryCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`story-card-${story.id}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [story.id]);

  // Add a staggered animation delay based on the index
  const animationDelay = `${index * 100}ms`;

  return (
    <Link 
      to={`/story/${story.id}`}
      id={`story-card-${story.id}`}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 h-full hover-lift',
        isInView ? 'animate-fade-in opacity-100' : 'opacity-0'
      )}
      style={{ animationDelay }}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div 
          className={cn(
            "absolute inset-0 bg-muted/20 backdrop-blur-sm transition-opacity duration-500",
            isLoaded ? "opacity-0" : "opacity-100"
          )}
        />
        <img
          src={story.coverImage}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium">
          {story.category}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <h3 className="font-display font-medium text-lg leading-tight mb-2 group-hover:text-foreground/80 transition-colors">
          {story.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow">
          {story.summary}
        </p>
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Ages {story.ageRange}</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {story.readingTime}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;
