
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BlogSection = () => {
  const { language } = useLanguage();
  
  // Sample blog posts focused on ChatPDF and document AI
  const blogPosts = [
    {
      id: 'chatpdf-vs-traditional',
      title: language === 'ar' ? 'ChatPDF مقابل قراءة PDF التقليدية: مقارنة شاملة' : 'ChatPDF vs Traditional PDF Reading: A Comprehensive Comparison',
      excerpt: language === 'ar' 
        ? 'اكتشف كيف تغير تقنية ChatPDF الطريقة التي نتفاعل بها مع المستندات ولماذا هي أكثر كفاءة من أساليب القراءة التقليدية.'
        : 'Discover how ChatPDF technology is changing the way we interact with documents and why it\'s more efficient than traditional reading methods.',
      date: '2023-10-15',
      readTime: language === 'ar' ? '5 دقائق للقراءة' : '5 min read',
      image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'chatpdf-education',
      title: language === 'ar' ? 'كيف يغير ChatPDF مشهد التعليم للطلاب والمعلمين' : 'How ChatPDF is Transforming Education for Students and Teachers',
      excerpt: language === 'ar'
        ? 'استكشف كيف يمكن لتقنية ChatPDF المبتكرة أن تحسن فهم الطلاب وتوفر الوقت للمعلمين من خلال تسهيل استخراج المعلومات من المستندات الأكاديمية.'
        : 'Explore how ChatPDF\'s innovative technology can improve student comprehension and save time for teachers by facilitating information extraction from academic documents.',
      date: '2023-11-02',
      readTime: language === 'ar' ? '7 دقائق للقراءة' : '7 min read',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'chatpdf-business',
      title: language === 'ar' ? 'تسريع عمليات الأعمال باستخدام ChatPDF: دراسة حالة' : 'Accelerating Business Processes with ChatPDF: A Case Study',
      excerpt: language === 'ar'
        ? 'تعرف على كيفية استخدام الشركات لتقنية ChatPDF لتحليل العقود والمستندات القانونية بسرعة أكبر بـ 10 مرات من الطرق التقليدية.'
        : 'Learn how businesses are using ChatPDF technology to analyze contracts and legal documents 10x faster than traditional methods.',
      date: '2023-12-08',
      readTime: language === 'ar' ? '6 دقائق للقراءة' : '6 min read',
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];
  
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
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{post.readTime}</span>
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
