
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabaseUntyped } from "@/integrations/supabase/client";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  created_at: string;
  read_time: string;
  image_url: string;
  category: string;
}

const BlogSection = () => {
  const { language } = useLanguage();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const { data, error } = await supabaseUntyped
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setBlogPosts(data as BlogPost[]);
        }
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogPosts();
  }, []);
  
  if (loading) {
    return (
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="heading-2 mb-4">
              {language === 'ar' ? 'آخر مدونات ChatPDF' : 'Latest from Our Blog'}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden h-full border-border/60">
                <div className="aspect-video w-full bg-muted animate-pulse"></div>
                <CardHeader>
                  <div className="h-4 bg-muted animate-pulse rounded w-24 mb-2"></div>
                  <div className="h-6 bg-muted animate-pulse rounded w-full"></div>
                  <div className="h-16 bg-muted animate-pulse rounded w-full"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }
  
  // If no posts fetched from DB, show empty state instead of sample data
  if (blogPosts.length === 0) {
    return null; // Don't show the blog section if no posts
  }
  
  return (
    <section id="blog" className="py-20 px-4 md:px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="heading-2 mb-4">
            {language === 'ar' ? 'آخر مدونات ChatPDF' : 'Latest from Our Blog'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'اكتشف أحدث المقالات حول كيفية استخدام ChatPDF وجميع الميزات الجديدة'
              : 'Discover the latest articles about how to use ChatPDF and all the new features'
            }
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              to={`/blog/${post.id}`}
              className="group block cursor-pointer"
            >
              <Card className="overflow-hidden h-full hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/20 hover:-translate-y-1 relative">
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
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{post.read_time}</span>
                  </div>
                  <CardTitle className="group-hover:text-primary transition-colors duration-300">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3 text-foreground/70">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium flex items-center text-primary group-hover:underline">
                    {language === 'ar' ? 'قراءة المزيد' : 'Read More'}
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </CardContent>
                <div className="absolute inset-0 z-10 cursor-pointer opacity-0">
                  {/* Invisible overlay to ensure the entire card is clickable */}
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button asChild variant="outline" className="animate-fade-in">
            <Link to="/blog">
              {language === 'ar' ? 'عرض جميع المقالات' : 'View All Articles'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
