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
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  read_time: string;
  image_url: string;
  category: string;
  content: string;
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
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setBlogPosts(data as BlogPost[]);
        } else {
          setBlogPosts(sampleBlogPosts);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts(sampleBlogPosts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, [language]);
  
  const sampleBlogPosts: BlogPost[] = [
    {
      id: 'chatpdf-vs-traditional',
      title: language === 'ar' 
        ? 'ChatPDF مقابل قراءة PDF التقليدية: مقارنة شاملة' 
        : 'ChatPDF vs Traditional PDF Reading: A Comprehensive Comparison',
      excerpt: language === 'ar'
        ? 'اكتشف كيف تغير تقنية ChatPDF الطريقة التي نتفاعل بها مع المستندات ولماذا هي أكثر كفاءة من أساليب القراءة التقليدية.'
        : 'Discover how ChatPDF technology is changing the way we interact with documents and why it\'s more efficient than traditional reading methods.',
      created_at: '2023-10-15',
      read_time: language === 'ar' ? '5 دقائق للقراءة' : '5 min read',
      category: language === 'ar' ? 'تكنولوجيا' : 'Technology',
      image_url: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: ''
    },
    {
      id: 'chatpdf-education',
      title: language === 'ar' 
        ? 'كيف يغير ChatPDF مشهد التعليم للطلاب والمعلمين'
        : 'How ChatPDF is Transforming Education for Students and Teachers',
      excerpt: language === 'ar'
        ? 'استكشف كيف يمكن لتقنية ChatPDF المبتكرة أن تحسن فهم الطلاب وتوفر الوقت للمعلمين من خلال تسهيل استخراج المعلومات من المستندات الأكاديمية.'
        : 'Explore how ChatPDF\'s innovative technology can improve student comprehension and save time for teachers by facilitating information extraction from academic documents.',
      created_at: '2023-11-02',
      read_time: language === 'ar' ? '7 دقائق للقراءة' : '7 min read',
      category: language === 'ar' ? 'تعليم' : 'Education',
      image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: ''
    },
    {
      id: 'chatpdf-business',
      title: language === 'ar' 
        ? 'تسريع عمليات الأعمال باستخدام ChatPDF: دراسة حالة'
        : 'Accelerating Business Processes with ChatPDF: A Case Study',
      excerpt: language === 'ar'
        ? 'Learn how businesses are using ChatPDF technology to analyze contracts and legal documents 10x faster than traditional methods.'
        : 'Learn how businesses are using ChatPDF technology to analyze contracts and legal documents 10x faster than traditional methods.',
      created_at: '2023-12-08',
      read_time: language === 'ar' ? '6 دقائق للقراءة' : '6 min read',
      category: language === 'ar' ? 'أعمال' : 'Business',
      image_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: ''
    },
    {
      id: 'chatpdf-research',
      title: language === 'ar' 
        ? 'كيف يمكن للباحثين استخدام ChatPDF لتسريع مراجعة الأدبيات العلمية'
        : 'How Researchers Can Use ChatPDF to Accelerate Literature Reviews',
      excerpt: language === 'ar'
        ? 'A comprehensive guide for researchers on how to use ChatPDF to summarize research papers and extract key findings efficiently.'
        : 'A comprehensive guide for researchers on how to use ChatPDF to summarize research papers and extract key findings efficiently.',
      created_at: '2024-01-15',
      read_time: language === 'ar' ? '8 دقائق للقراءة' : '8 min read',
      category: language === 'ar' ? 'بحث علمي' : 'Research',
      image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: ''
    },
    {
      id: 'chatpdf-legal',
      title: language === 'ar' 
        ? 'ChatPDF for Lawyers: How to Improve Legal Document Review'
        : 'ChatPDF for Lawyers: How to Improve Legal Document Review',
      excerpt: language === 'ar'
        ? 'Discover how lawyers can use ChatPDF to analyze contracts, discover legal loopholes, and save hours of manual work.'
        : 'Discover how lawyers can use ChatPDF to analyze contracts, discover legal loopholes, and save hours of manual work.',
      created_at: '2024-02-22',
      read_time: language === 'ar' ? '9 دقائق للقراءة' : '9 min read',
      category: language === 'ar' ? 'قانون' : 'Legal',
      image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: ''
    },
    {
      id: 'chatpdf-student',
      title: language === 'ar' 
        ? 'دليل الطالب لاستخدام ChatPDF للدراسة الفعالة'
        : 'The Student\'s Guide to Using ChatPDF for Effective Studying',
      excerpt: language === 'ar'
        ? 'Tips and tricks for students on how to use ChatPDF to understand complex textbooks, summarize lectures, and prepare for exams.'
        : 'Tips and tricks for students on how to use ChatPDF to understand complex textbooks, summarize lectures, and prepare for exams.',
      created_at: '2024-03-10',
      read_time: language === 'ar' ? '6 دقائق للقراءة' : '6 min read',
      category: language === 'ar' ? 'تعليم' : 'Education',
      image_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      content: ''
    }
  ];
  
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
                      to={`/blog/${post.id}`}
                      className="group block h-full"
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/20 hover:-translate-y-1">
                        <div className="aspect-video w-full overflow-hidden">
                          <img 
                            src={post.image_url} 
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
