
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { stories } from '@/data/stories';
import Navbar from '@/components/Navbar';
import { ArrowLeft, Clock, ArrowDown, Share } from 'lucide-react';
import { toast } from 'sonner';

const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const story = stories.find(s => s.id === id);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCoverVisible, setIsCoverVisible] = useState(true);
  const [isScrollIconVisible, setIsScrollIconVisible] = useState(true);

  useEffect(() => {
    if (!story) {
      navigate('/stories');
      return;
    }
    
    // Simulate loading to ensure animations trigger correctly
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Hide cover when scrolled down
      setIsCoverVisible(scrollPosition < 50);
      // Hide scroll icon after scrolling down a bit
      setIsScrollIconVisible(scrollPosition < 100);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [story, navigate]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.summary,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast('Link copied to clipboard');
    }
  };
  
  if (!story) {
    return null; // Navigate happens in useEffect
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Cover Section */}
      <div 
        className={`fixed inset-0 z-10 transition-opacity duration-1000 ${
          isCoverVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.4)), url(${story.coverImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-16 container mx-auto max-w-4xl">
          <div className={`transition-all duration-500 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="inline-block rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm font-medium text-white mb-4">
              {story.category} • Ages {story.ageRange}
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
              {story.title}
            </h1>
            
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              {story.summary}
            </p>
            
            <div className="flex items-center text-sm text-white/80 mb-8">
              <Clock className="h-4 w-4 mr-2" />
              {story.readingTime} reading time
            </div>
          </div>
          
          {/* Scroll down indicator */}
          <div 
            className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-opacity duration-500 ${
              isScrollIconVisible && isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ArrowDown className="h-6 w-6 text-white animate-bounce" />
          </div>
        </div>
      </div>
      
      {/* Content Section */}
      <main 
        ref={contentRef}
        className={`relative z-20 flex-1 bg-background mt-[100vh] rounded-t-[30px] shadow-lg transition-all duration-500 transform ${
          isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 py-16 max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <Link 
              to="/stories" 
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to stories
            </Link>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="Share story"
            >
              <Share className="h-5 w-5" />
            </button>
          </div>
          
          <div className="prose max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="paragraph mb-6">
                {paragraph}
              </p>
            ))}
          </div>
          
          <div className="border-t border-border mt-16 pt-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Category</span>
                <div className="text-base font-medium">{story.category}</div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Age Range</span>
                <div className="text-base font-medium">Ages {story.ageRange}</div>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Reading Time</span>
                <div className="text-base font-medium">{story.readingTime}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-background border-t border-border py-10 relative z-20">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="text-sm">
            © {new Date().getFullYear()} StoryTime. A magical place for children's stories.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default StoryDetail;
