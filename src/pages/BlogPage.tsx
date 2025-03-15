
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const BlogPage = () => {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample blog posts with ChatPDF as the main keyword focus
  const allBlogPosts = [
    {
      id: 'chatpdf-vs-traditional',
      title: language === 'ar' ? 'ChatPDF مقابل قراءة PDF التقليدية: مقارنة شاملة' : 'ChatPDF vs Traditional PDF Reading: A Comprehensive Comparison',
      excerpt: language === 'ar' 
        ? 'اكتشف كيف تغير تقنية ChatPDF الطريقة التي نتفاعل بها مع المستندات ولماذا هي أكثر كفاءة من أساليب القراءة التقليدية.'
        : 'Discover how ChatPDF technology is changing the way we interact with documents and why it\'s more efficient than traditional reading methods.',
      date: '2023-10-15',
      readTime: language === 'ar' ? '5 دقائق للقراءة' : '5 min read',
      category: language === 'ar' ? 'تكنولوجيا' : 'Technology',
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
      category: language === 'ar' ? 'تعليم' : 'Education',
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
      category: language === 'ar' ? 'أعمال' : 'Business',
      image: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'chatpdf-research',
      title: language === 'ar' ? 'كيف يمكن للباحثين استخدام ChatPDF لتسريع مراجعة الأدبيات العلمية' : 'How Researchers Can Use ChatPDF to Accelerate Literature Reviews',
      excerpt: language === 'ar'
        ? 'دليل شامل للباحثين حول كيفية استخدام ChatPDF لتلخيص الأوراق البحثية واستخلاص النتائج الرئيسية بكفاءة.'
        : 'A comprehensive guide for researchers on how to use ChatPDF to summarize research papers and extract key findings efficiently.',
      date: '2024-01-15',
      readTime: language === 'ar' ? '8 دقائق للقراءة' : '8 min read',
      category: language === 'ar' ? 'بحث علمي' : 'Research',
      image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'chatpdf-legal',
      title: language === 'ar' ? 'ChatPDF للمحامين: كيفية تحسين مراجعة المستندات القانونية' : 'ChatPDF for Lawyers: How to Improve Legal Document Review',
      excerpt: language === 'ar'
        ? 'اكتشف كيف يمكن للمحامين استخدام ChatPDF لتحليل العقود واكتشاف الثغرات القانونية وتوفير ساعات من العمل اليدوي.'
        : 'Discover how lawyers can use ChatPDF to analyze contracts, discover legal loopholes, and save hours of manual work.',
      date: '2024-02-22',
      readTime: language === 'ar' ? '9 دقائق للقراءة' : '9 min read',
      category: language === 'ar' ? 'قانون' : 'Legal',
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    {
      id: 'chatpdf-student',
      title: language === 'ar' ? 'دليل الطالب لاستخدام ChatPDF للدراسة الفعالة' : 'The Student\'s Guide to Using ChatPDF for Effective Studying',
      excerpt: language === 'ar'
        ? 'نصائح وحيل للطلاب حول كيفية استخدام ChatPDF لفهم الكتب المدرسية المعقدة وتلخيص المحاضرات والاستعداد للاختبارات.'
        : 'Tips and tricks for students on how to use ChatPDF to understand complex textbooks, summarize lectures, and prepare for exams.',
      date: '2024-03-10',
      readTime: language === 'ar' ? '6 دقائق للقراءة' : '6 min read',
      category: language === 'ar' ? 'تعليم' : 'Education',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    }
  ];
  
  // Filter blog posts based on search term
  const filteredPosts = searchTerm
    ? allBlogPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allBlogPosts;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="pt-32 pb-10 px-4 md:px-6 container mx-auto max-w-7xl">
        <h1 className="heading-1 mb-6">
          {language === 'ar' ? 'مدونة ChatPDF' : 'ChatPDF Blog'}
        </h1>
        
        <p className="paragraph mb-10 max-w-3xl">
          {language === 'ar'
            ? 'استكشف أحدث المقالات حول كيفية استخدام ChatPDF وفوائده وكيف يمكن أن يساعدك في العمل والدراسة.'
            : 'Explore the latest articles about how to use ChatPDF, its benefits, and how it can help you in work and study.'}
        </p>
        
        <div className="relative w-full max-w-xl mb-12">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={language === 'ar' ? 'ابحث في المدونة...' : 'Search blog posts...'}
            className="pl-10 py-6"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span className="bg-muted px-2 py-1 rounded-full">{post.category}</span>
                  <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{post.date}</span>
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  <Link 
                    to={`/blog/${post.id}`}
                    className="text-sm font-medium flex items-center text-primary hover:underline"
                  >
                    {language === 'ar' ? 'قراءة المزيد' : 'Read More'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto py-10 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 md:px-6 text-center text-muted-foreground">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="font-display text-lg font-medium">
              {language === 'ar' ? 'ChatPDF' : 'ChatPDF'}
            </span>
          </div>
          <p className="text-sm">
            {language === 'ar' 
              ? `© ${new Date().getFullYear()} ChatPDF. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} ChatPDF. All rights reserved.`
            }
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
