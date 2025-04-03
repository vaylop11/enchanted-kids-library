
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Search, Clock, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { supabaseUntyped } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  read_time: string;
  image_url: string;
  category: string;
  content: string;
  slug: string;
}

const BlogPage = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data, error } = await supabaseUntyped
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        setBlogPosts(data || []);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, [language]);
  
  const categories = Array.from(new Set(blogPosts.map(post => post.category)));
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  const hasActiveFilters = searchTerm || selectedCategory;
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Gemi ChatPDF Blog - AI PDF Chat Tips & Tutorials"
        description="Explore the latest articles about Gemi ChatPDF, AI-powered PDF analysis, document chat, and helpful tutorials to get the most out of your PDFs."
        keywords="Gemi ChatPDF, PDF chat blog, AI document analysis, PDF tutorials, document AI"
      />
      
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 md:px-6 container mx-auto max-w-7xl animate-fade-in">
        <div className="mb-16 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight mb-6">
            {language === 'ar' ? 'مدونة ChatPDF' : 'ChatPDF Blog'}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-10">
            {language === 'ar'
              ? 'استكشف أحدث المقالات حول كيفية استخدام ChatPDF وفوائده وكيف يمكن أن يساعدك في العمل والدراسة.'
              : 'Explore the latest articles about how to use ChatPDF, its benefits, and how it can help you in work and study.'}
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className={`relative w-full md:max-w-md transition-all duration-300 ${isSearchFocused ? 'md:max-w-xl' : ''}`}>
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 transition-all duration-300 ${isSearchFocused ? 'text-foreground' : ''}`} />
            <Input
              type="text"
              placeholder={language === 'ar' ? 'ابحث في المدونة...' : 'Search blog posts...'}
              className="pl-10 py-6 border-muted focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Badge 
                key={category}
                variant={selectedCategory === category ? "default" : "outline"} 
                className="cursor-pointer text-xs py-2"
                onClick={() => setSelectedCategory(prevCategory => prevCategory === category ? null : category)}
              >
                {category}
              </Badge>
            ))}
            
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-xs h-8 ml-2"
              >
                <X className="h-3 w-3 mr-1" />
                {language === 'ar' ? 'مسح التصفية' : 'Clear filters'}
              </Button>
            )}
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-r-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {filteredPosts.length > 0 ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPosts.map((post, index) => (
                  <motion.div key={post.id} variants={itemVariants}>
                    <Link
                      to={`/blog/${post.slug || post.id}`}
                      className="group block h-full"
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/20 hover:-translate-y-1">
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              // Fallback image if the original fails to load
                              const target = e.target as HTMLImageElement;
                              target.src = "https://images.unsplash.com/photo-1516383607781-913a19294fd1?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max";
                            }}
                          />
                        </div>
                        <CardHeader>
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                            <Badge variant="outline" className="bg-primary/5">{post.category}</Badge>
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors duration-300">{post.title}</CardTitle>
                          <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{post.read_time}</span>
                            </div>
                            <div className="text-sm font-medium flex items-center text-primary group-hover:underline">
                              {language === 'ar' ? 'قراءة المزيد' : 'Read More'}
                              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 bg-muted/20 rounded-lg">
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'ar' ? 'لم يتم العثور على مقالات' : 'No articles found'}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'ar' 
                    ? 'حاول تعديل معايير البحث الخاصة بك'
                    : 'Try adjusting your search criteria'
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="mt-4">
                    {language === 'ar' ? 'مسح التصفية' : 'Clear filters'}
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPage;
