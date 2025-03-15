
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Calendar, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogPostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  category: string;
  image: string;
}

const getBlogPost = (id: string, language: string): BlogPostData | null => {
  // Simulate fetching a blog post based on ID
  const blogPosts: Record<string, BlogPostData> = {
    'chatpdf-vs-traditional': {
      id: 'chatpdf-vs-traditional',
      title: language === 'ar'
        ? 'ChatPDF مقابل قراءة PDF التقليدية: مقارنة شاملة'
        : 'ChatPDF vs Traditional PDF Reading: A Comprehensive Comparison',
      excerpt: language === 'ar'
        ? 'اكتشف كيف تغير تقنية ChatPDF الطريقة التي نتفاعل بها مع المستندات.'
        : 'Discover how ChatPDF technology is changing the way we interact with documents.',
      content: language === 'ar'
        ? `<p>في العصر الرقمي الحالي، أصبحت ملفات PDF جزءًا لا يتجزأ من حياتنا المهنية والشخصية. ومع ذلك، يواجه الكثير منا تحديات في استخراج المعلومات ذات الصلة بسرعة من هذه المستندات.</p>
           <p>هنا يأتي دور <strong>ChatPDF</strong>، وهو تقنية ثورية تغير الطريقة التي نتفاعل بها مع مستندات PDF.</p>
           <h2>لماذا تعتبر القراءة التقليدية لملفات PDF غير فعالة؟</h2>
           <p>تتطلب الطرق التقليدية لقراءة ملفات PDF قراءة المستند بأكمله للعثور على معلومات محددة. هذا يستهلك الكثير من الوقت ويقلل من الإنتاجية بشكل كبير، خاصة عندما تتعامل مع مستندات طويلة أو معقدة.</p>
           <h2>كيف يحل ChatPDF هذه المشكلة؟</h2>
           <p>يستخدم <strong>ChatPDF</strong> الذكاء الاصطناعي المتقدم لفهم محتوى ملفات PDF الخاصة بك. بدلاً من البحث يدويًا عن المعلومات، يمكنك ببساطة طرح سؤال حول المستند والحصول على إجابة فورية.</p>
           <h2>فوائد استخدام ChatPDF</h2>
           <ul>
             <li>توفير الوقت: قم بتقليل وقت البحث بنسبة 80%.</li>
             <li>دقة أعلى: احصل على إجابات دقيقة مستندة إلى محتوى المستند.</li>
             <li>سهولة الاستخدام: واجهة محادثة بسيطة وبديهية.</li>
             <li>فهم أفضل: استخرج الأفكار الرئيسية بسرعة من المستندات المعقدة.</li>
           </ul>
           <h2>مقارنة الأداء</h2>
           <p>وفقًا لدراساتنا الداخلية، يمكن لمستخدمي <strong>ChatPDF</strong> العثور على معلومات محددة في المستندات بسرعة أكبر 5 مرات من الطرق التقليدية. هذا يترجم إلى توفير وقت كبير خاصة للمهنيين مثل المحامين والباحثين والطلاب.</p>
           <h2>الخلاصة</h2>
           <p>في عالم يتزايد فيه حجم المعلومات باستمرار، تعد أدوات مثل <strong>ChatPDF</strong> ضرورية لمساعدتنا على البقاء منتجين وفعالين. من خلال دمج الذكاء الاصطناعي مع تنسيق PDF الشائع، يوفر ChatPDF حلاً مبتكرًا للتحديات القديمة في استخراج المعلومات.</p>
           <p>جرب <strong>ChatPDF</strong> اليوم واكتشف كيف يمكن أن يحول تجربة قراءة PDF الخاصة بك.</p>`
        : `<p>In today's digital age, PDF documents have become an integral part of our professional and personal lives. However, many of us face challenges in quickly extracting relevant information from these documents.</p>
           <p>This is where <strong>ChatPDF</strong> comes in, a revolutionary technology that's changing the way we interact with PDF documents.</p>
           <h2>Why Traditional PDF Reading is Inefficient</h2>
           <p>Traditional methods of reading PDFs require scanning through the entire document to find specific information. This is time-consuming and significantly reduces productivity, especially when dealing with lengthy or complex documents.</p>
           <h2>How ChatPDF Solves This Problem</h2>
           <p><strong>ChatPDF</strong> uses advanced AI to understand the content of your PDF files. Instead of manually searching for information, you can simply ask a question about the document and get an immediate answer.</p>
           <h2>Benefits of Using ChatPDF</h2>
           <ul>
             <li>Time Savings: Reduce research time by 80%.</li>
             <li>Higher Accuracy: Get precise answers based on document content.</li>
             <li>Ease of Use: Simple, intuitive chat interface.</li>
             <li>Better Comprehension: Quickly extract key insights from complex documents.</li>
           </ul>
           <h2>Performance Comparison</h2>
           <p>According to our internal studies, <strong>ChatPDF</strong> users can find specific information in documents 5x faster than traditional methods. This translates to significant time savings, especially for professionals like lawyers, researchers, and students.</p>
           <h2>Conclusion</h2>
           <p>In a world where the volume of information continues to grow, tools like <strong>ChatPDF</strong> are essential to help us stay productive and efficient. By combining AI with the ubiquitous PDF format, ChatPDF provides an innovative solution to age-old challenges in information extraction.</p>
           <p>Try <strong>ChatPDF</strong> today and discover how it can transform your PDF reading experience.</p>`,
      date: '2023-10-15',
      author: language === 'ar' ? 'أحمد الشمري' : 'Emma Johnson',
      readTime: language === 'ar' ? '5 دقائق للقراءة' : '5 min read',
      category: language === 'ar' ? 'تكنولوجيا' : 'Technology',
      image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    'chatpdf-education': {
      id: 'chatpdf-education',
      title: language === 'ar'
        ? 'كيف يغير ChatPDF مشهد التعليم للطلاب والمعلمين'
        : 'How ChatPDF is Transforming Education for Students and Teachers',
      excerpt: language === 'ar'
        ? 'استكشف كيف يمكن لتقنية ChatPDF المبتكرة أن تحسن فهم الطلاب.'
        : 'Explore how ChatPDF\'s innovative technology can improve student comprehension.',
      content: language === 'ar'
        ? `<p>يواجه الطلاب والمعلمون على حد سواء تحديًا مستمرًا في التعامل مع كميات هائلة من المواد التعليمية في شكل ملفات PDF. من الكتب المدرسية إلى أوراق البحث والمحاضرات، أصبح تنسيق PDF معيارًا في التعليم الحديث.</p>
           <p>في هذا المقال، سنستكشف كيف يمكن لتقنية <strong>ChatPDF</strong> أن تعيد تشكيل الطريقة التي يتعلم بها الطلاب ويعلم بها المعلمون.</p>
           <h2>تحديات التعلم التقليدي مع ملفات PDF</h2>
           <p>غالبًا ما يجد الطلاب صعوبة في استيعاب المعلومات من الكتب المدرسية الطويلة، مما يؤدي إلى:</p>
           <ul>
             <li>إجهاد القراءة والتعب المعرفي</li>
             <li>صعوبة في تحديد الأفكار الرئيسية</li>
             <li>احتفاظ منخفض بالمعلومات</li>
             <li>وقت دراسة غير فعال</li>
           </ul>
           <h2>كيف يساعد ChatPDF الطلاب</h2>
           <p>من خلال استخدام <strong>ChatPDF</strong>، يمكن للطلاب:</p>
           <ul>
             <li>طرح أسئلة مباشرة حول محتوى الكتاب المدرسي</li>
             <li>الحصول على ملخصات فورية للفصول الطويلة</li>
             <li>فهم المفاهيم المعقدة من خلال شرح مبسط</li>
             <li>التحقق من فهمهم من خلال اختبارات تفاعلية</li>
           </ul>
           <h2>فوائد ChatPDF للمعلمين</h2>
           <p>لا يقتصر الأمر على الطلاب، بل يمكن للمعلمين أيضًا الاستفادة من <strong>ChatPDF</strong> من خلال:</p>
           <ul>
             <li>إنشاء مواد تعليمية مخصصة بسرعة</li>
             <li>تحليل أعمال الطلاب بشكل أكثر كفاءة</li>
             <li>تقديم ملاحظات أكثر تفصيلاً</li>
             <li>توفير الوقت في تحضير الدروس</li>
           </ul>
           <h2>دراسات حالة في المؤسسات التعليمية</h2>
           <p>أظهرت الاختبارات التجريبية في عدة جامعات أن الطلاب الذين استخدموا <strong>ChatPDF</strong> لدراستهم حققوا درجات أعلى بنسبة 27% في المتوسط ​​مقارنة بطرق الدراسة التقليدية.</p>
           <p>في إحدى المدارس الثانوية، أبلغ المعلمون عن توفير 5-7 ساعات أسبوعيًا في إعداد الدروس بعد دمج <strong>ChatPDF</strong> في سير عملهم.</p>
           <h2>المستقبل: التعلم الشخصي باستخدام ChatPDF</h2>
           <p>مع تطور الذكاء الاصطناعي، سيصبح <strong>ChatPDF</strong> أكثر قدرة على:</p>
           <ul>
             <li>تخصيص شرح المحتوى بناءً على أنماط التعلم الفردية</li>
             <li>التنبؤ بالمناطق التي قد يواجه فيها الطلاب صعوبات</li>
             <li>تكييف المواد التعليمية وفقًا لمستوى فهم كل طالب</li>
           </ul>
           <h2>الخلاصة</h2>
           <p>يعد <strong>ChatPDF</strong> أكثر من مجرد أداة تكنولوجية؛ إنه يمثل تحولًا أساسيًا في كيفية تفاعلنا مع المحتوى التعليمي. من خلال جعل المعلومات أكثر سهولة في الوصول إليها وفهمها، فإنه يفتح إمكانيات جديدة للطلاب والمعلمين على حد سواء.</p>`
        : `<p>Students and teachers alike face an ongoing challenge in dealing with vast amounts of educational materials in PDF format. From textbooks to research papers and lecture notes, PDF has become a standard in modern education.</p>
           <p>In this article, we'll explore how <strong>ChatPDF</strong> technology can reshape the way students learn and teachers teach.</p>
           <h2>Challenges of Traditional Learning with PDFs</h2>
           <p>Students often struggle to absorb information from lengthy textbooks, leading to:</p>
           <ul>
             <li>Reading fatigue and cognitive overload</li>
             <li>Difficulty identifying key ideas</li>
             <li>Low information retention</li>
             <li>Inefficient study time</li>
           </ul>
           <h2>How ChatPDF Helps Students</h2>
           <p>By using <strong>ChatPDF</strong>, students can:</p>
           <ul>
             <li>Ask direct questions about textbook content</li>
             <li>Get instant summaries of lengthy chapters</li>
             <li>Understand complex concepts through simplified explanations</li>
             <li>Test their comprehension through interactive quizzes</li>
           </ul>
           <h2>Benefits for Teachers</h2>
           <p>Teachers aren't left out - they can also benefit from <strong>ChatPDF</strong> by:</p>
           <ul>
             <li>Creating customized teaching materials quickly</li>
             <li>Analyzing student work more efficiently</li>
             <li>Providing more detailed feedback</li>
             <li>Saving time in lesson preparation</li>
           </ul>
           <h2>Case Studies in Educational Institutions</h2>
           <p>Pilot tests in several universities showed that students who used <strong>ChatPDF</strong> for their studies achieved 27% higher grades on average compared to traditional study methods.</p>
           <p>In one high school, teachers reported saving 5-7 hours weekly in lesson preparation after integrating <strong>ChatPDF</strong> into their workflow.</p>
           <h2>The Future: Personalized Learning Using ChatPDF</h2>
           <p>As AI evolves, <strong>ChatPDF</strong> will become more capable of:</p>
           <ul>
             <li>Customizing content explanations based on individual learning patterns</li>
             <li>Predicting areas where students might struggle</li>
             <li>Adapting teaching materials according to each student's level of understanding</li>
           </ul>
           <h2>Conclusion</h2>
           <p><strong>ChatPDF</strong> is more than just a technological tool; it represents a fundamental shift in how we interact with educational content. By making information more accessible and understandable, it opens new possibilities for both students and teachers alike.</p>`,
      date: '2023-11-02',
      author: language === 'ar' ? 'سارة القحطاني' : 'Michael Chen',
      readTime: language === 'ar' ? '7 دقائق للقراءة' : '7 min read',
      category: language === 'ar' ? 'تعليم' : 'Education',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    },
    // Add more blog posts as needed
  };
  
  return blogPosts[id] || null;
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);

  useEffect(() => {
    if (id) {
      const fetchedPost = getBlogPost(id, language);
      if (fetchedPost) {
        setPost(fetchedPost);
        
        // Simulate fetching related posts
        const related = [
          getBlogPost('chatpdf-education', language),
          getBlogPost('chatpdf-vs-traditional', language)
        ].filter(p => p && p.id !== id) as BlogPostData[];
        
        setRelatedPosts(related);
      } else {
        navigate('/blog');
      }
    }
  }, [id, language, navigate]);

  if (!post) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <article className="pt-32 pb-20 px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="container mx-auto max-w-4xl mb-8">
          <div className="flex items-center text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              {language === 'ar' ? 'الرئيسية' : 'Home'}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <Link to="/blog" className="hover:text-foreground">
              {language === 'ar' ? 'المدونة' : 'Blog'}
            </Link>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="truncate max-w-[200px]">{post.title}</span>
          </div>
        </div>
        
        {/* Article Header */}
        <header className="container mx-auto max-w-4xl mb-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/blog')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'العودة إلى المدونة' : 'Back to Blog'}
          </Button>
          
          <h1 className="heading-1 mb-6">{post.title}</h1>
          
          <div className="flex items-center text-sm text-muted-foreground mb-8">
            <div className="flex items-center mr-4">
              <User className="h-4 w-4 mr-1" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center mr-4">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{post.date}</span>
            </div>
            <span>{post.readTime}</span>
          </div>
          
          <div className="rounded-2xl overflow-hidden aspect-[21/9] mb-10">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </header>
        
        {/* Article Content */}
        <div className="container mx-auto max-w-3xl">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="container mx-auto max-w-4xl mt-20 pt-10 border-t">
            <h2 className="heading-3 mb-8">
              {language === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map(related => (
                <Link 
                  key={related.id}
                  to={`/blog/${related.id}`}
                  className="flex group hover:bg-muted/50 rounded-lg p-4 transition-colors"
                >
                  <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4">
                    <img 
                      src={related.image} 
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {related.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
      
      {/* Call to Action */}
      <div className="bg-muted/30 py-16 px-4 md:px-6">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="heading-2 mb-4">
            {language === 'ar' ? 'جرب ChatPDF اليوم' : 'Try ChatPDF Today'}
          </h2>
          <p className="paragraph mb-8 max-w-2xl mx-auto">
            {language === 'ar'
              ? 'قم بتحميل ملفات PDF الخاصة بك وابدأ الدردشة معها. لا حاجة للتسجيل أو التثبيت.'
              : 'Upload your PDF files and start chatting with them. No registration or installation required.'}
          </p>
          <Link 
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-6 py-3 text-base font-medium text-background shadow-sm transition-colors hover:bg-foreground/90"
          >
            {language === 'ar' ? 'ابدأ باستخدام ChatPDF' : 'Start Using ChatPDF'}
          </Link>
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

export default BlogPost;
