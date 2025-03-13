
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { stories, storyCategories } from '@/data/stories';
import StoryCard from '@/components/StoryCard';
import Navbar from '@/components/Navbar';
import { ChevronRight, BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, language } = useLanguage();

  useEffect(() => {
    // Simulate loading to ensure animations trigger correctly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Featured stories - first 3 stories
  const featuredStories = stories.slice(0, 3);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className={`transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-block rounded-full bg-primary px-3 py-1 text-sm font-medium mb-6 animate-fade-in">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {t('welcomeToStoryTime')}
            </span>
          </div>
          
          <h1 className="heading-1 mb-6 max-w-4xl">
            {t('discoverStories')}
          </h1>
          
          <p className="paragraph mb-8 max-w-3xl">
            {t('description')}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link 
              to="/stories" 
              className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background shadow-sm transition-colors hover:bg-foreground/90"
            >
              {t('browseStories')}
            </Link>
            <a 
              href="#featured" 
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-base font-medium shadow-sm transition-colors hover:bg-muted"
            >
              {t('featuredStories')}
            </a>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <h2 className="heading-2 mb-8 text-center">
            {t('storyCategories')}
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {storyCategories.map((category, index) => (
              <Link
                key={category}
                to={`/stories?category=${category}`}
                className="group flex flex-col items-center justify-center p-6 rounded-xl bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-lg font-medium mb-1 group-hover:text-foreground/80 transition-colors">
                  {category}
                </div>
                <span className="text-sm text-muted-foreground">
                  {stories.filter(s => s.category === category).length} {language === 'ar' ? 'قصة' : 'stories'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Stories Section */}
      <section id="featured" className="py-20 px-4 md:px-6 container mx-auto max-w-7xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="heading-2">{t('featuredStories')}</h2>
          <Link 
            to="/stories" 
            className="text-sm font-medium flex items-center hover:underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('viewAllStories')}
            <ChevronRight className={`h-4 w-4 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredStories.map((story, index) => (
            <StoryCard key={story.id} story={story} index={index} />
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-5 w-5" />
            <span className="font-display text-lg font-medium">
              {language === 'ar' ? 'وقت القصة' : 'StoryTime'}
            </span>
          </div>
          <p className="text-sm">
            {t('copyright').replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
