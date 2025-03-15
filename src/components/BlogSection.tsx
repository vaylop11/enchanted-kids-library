
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

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
    <section id="blog" className="py-20 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-end mb-10">
          <h2 className="heading-2">
            {language === 'ar' ? 'آخر مدونات ChatPDF' : 'Latest ChatPDF Blog Posts'}
          </h2>
          <Link 
            to="/blog" 
            className="text-sm font-medium flex items-center hover:underline text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'ar' ? 'عرض جميع المقالات' : 'View All Articles'}
            <ArrowRight className={`h-4 w-4 ${language === 'ar' ? 'mr-1 rotate-180' : 'ml-1'}`} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, index) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Calendar className="h-3.5 w-3.5 mr-1" />
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link 
                  to={`/blog/${post.id}`}
                  className="text-sm font-medium flex items-center text-primary hover:underline"
                >
                  {language === 'ar' ? 'قراءة المزيد' : 'Read More'}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
