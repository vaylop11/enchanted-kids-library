
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { stories, storyCategories, Story } from '@/data/stories';
import StoryCard from '@/components/StoryCard';
import Navbar from '@/components/Navbar';
import { Search, Filter, X } from 'lucide-react';

const Stories = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryParam = queryParams.get('category');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryParam);
  const [selectedAgeRange, setSelectedAgeRange] = useState<string | null>(null);
  const [filteredStories, setFilteredStories] = useState<Story[]>(stories);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Update filtered stories when filters change
  useEffect(() => {
    let result = stories;
    
    // Filter by search term
    if (searchTerm) {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(
        story => 
          story.title.toLowerCase().includes(lowercaseSearch) || 
          story.summary.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(story => story.category === selectedCategory);
    }
    
    // Filter by age range
    if (selectedAgeRange) {
      result = result.filter(story => story.ageRange === selectedAgeRange);
    }
    
    setFilteredStories(result);
  }, [searchTerm, selectedCategory, selectedAgeRange]);
  
  // Update URL when category filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    
    navigate({ search: params.toString() }, { replace: true });
  }, [selectedCategory, navigate]);
  
  // Set the category from URL params when component mounts
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedAgeRange(null);
  };
  
  // Get unique age ranges from stories
  const ageRanges = [...new Set(stories.map(story => story.ageRange))];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-20 px-4 md:px-6 container mx-auto max-w-7xl animate-fade-in">
        <div className="mb-10">
          <h1 className="heading-2 mb-4">Explore Stories</h1>
          <p className="paragraph max-w-3xl">
            Browse our collection of carefully crafted stories for children of all ages. 
            Use the filters to find the perfect story for your little one.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search Bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {/* Filter Button - Mobile */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border border-input bg-background shadow-sm hover:bg-muted transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </button>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-3 space-y-6">
            <div>
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedCategory === null
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted transition-colors'
                  }`}
                >
                  All Categories
                </button>
                {storyCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === category
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted transition-colors'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">Age Range</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedAgeRange(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    selectedAgeRange === null
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted transition-colors'
                  }`}
                >
                  All Ages
                </button>
                {ageRanges.map(ageRange => (
                  <button
                    key={ageRange}
                    onClick={() => setSelectedAgeRange(ageRange)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedAgeRange === ageRange
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted transition-colors'
                    }`}
                  >
                    Ages {ageRange}
                  </button>
                ))}
              </div>
            </div>
            
            {(selectedCategory || selectedAgeRange || searchTerm) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Clear all filters
              </button>
            )}
          </div>
          
          {/* Filters - Mobile */}
          <div
            className={`fixed inset-0 z-40 transform ${
              isFilterOpen ? 'translate-x-0' : 'translate-x-full'
            } lg:hidden transition-transform duration-300 ease-in-out bg-background shadow-xl w-full max-w-sm ml-auto overflow-auto`}
          >
            <div className="p-4 border-b sticky top-0 bg-background z-10">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="h-8 w-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedCategory === null
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted transition-colors'
                    }`}
                  >
                    All Categories
                  </button>
                  {storyCategories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedCategory === category
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-muted transition-colors'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Age Range</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedAgeRange(null)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedAgeRange === null
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted transition-colors'
                    }`}
                  >
                    All Ages
                  </button>
                  {ageRanges.map(ageRange => (
                    <button
                      key={ageRange}
                      onClick={() => setSelectedAgeRange(ageRange)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedAgeRange === ageRange
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-muted transition-colors'
                      }`}
                    >
                      Ages {ageRange}
                    </button>
                  ))}
                </div>
              </div>
              
              {(selectedCategory || selectedAgeRange || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear all filters
                </button>
              )}
              
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full mt-4 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-sm transition-colors hover:bg-foreground/90"
              >
                Apply Filters
              </button>
            </div>
          </div>
          
          {/* Story Grid */}
          <div className="lg:col-span-9">
            {filteredStories.length > 0 ? (
              <>
                <div className="text-sm text-muted-foreground mb-6">
                  Showing {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStories.map((story, index) => (
                    <StoryCard key={story.id} story={story} index={index} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <h3 className="heading-3 mb-2">No stories found</h3>
                <p className="paragraph">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 inline-flex items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <p className="text-sm">
            © {new Date().getFullYear()} StoryTime. A magical place for children's stories.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Stories;
