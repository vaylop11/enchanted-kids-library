import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Calendar, ChevronRight, Clock, Tag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
  tags?: string[];
}

const getBlogPost = (id: string, language: string): BlogPostData | null => {
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
           <h2 id="why-traditional-pdf-inefficient">لماذا تعتبر القراءة التقليدية لملفات PDF غير فعالة؟</h2>
           <p>تتطلب الطرق التقليدية لقراءة ملفات PDF قراءة المستند بأكمله للعثور على معلومات محددة. هذا يستهلك الكثير من الوقت ويقلل من الإنتاجية بشكل كبير، خاصة عندما تتعامل مع مستندات طويلة أو معقدة.</p>
           <p>على سبيل المثال، تخيل أنك تحاول العثور على معلومة محددة في تقرير من 100 صفحة - ستقضي وقتًا طويلاً في التمرير والبحث. اقرأ المزيد عن <a href="/blog/chatpdf-education" class="text-primary hover:underline">كيف يغير ChatPDF التعليم</a> لمعرفة تأثيره على البحث الأكاديمي.</p>
           <h2 id="how-chatpdf-solves">كيف يحل ChatPDF هذه المشكلة؟</h2>
           <p>يستخدم <strong>ChatPDF</strong> الذكاء الاصطناعي المتقدم لفهم محتوى ملفات PDF الخاصة بك. بدلاً من البحث يدويًا عن المعلومات، يمكنك ببساطة طرح سؤال حول المستند والحصول على إجابة فورية.</p>
           <p>يتيح ذلك للمستخدمين استخراج المعلومات ذات الصلة دون الحاجة إلى قراءة المستند بأكمله، مما يؤدي إلى زيادة كبيرة في الإنتاجية. يمكنك معرفة المزيد عن استخدام هذه التقنية في بيئة العمل في مقالنا عن <a href="/blog/chatpdf-business" class="text-primary hover:underline">تسريع عمليات الأعمال باستخدام ChatPDF</a>.</p>
           <h2 id="benefits">فوائد استخدام ChatPDF</h2>
           <ul>
             <li><strong>توفير الوقت:</strong> قم بتقليل وقت البحث بنسبة 80%.</li>
             <li><strong>دقة أعلى:</strong> احصل على إجابات دقيقة مستندة إلى محتوى المستند.</li>
             <li><strong>سهولة الاستخدام:</strong> واجهة محادثة بسيطة وبديهية.</li>
             <li><strong>فهم أفضل:</strong> استخرج الأفكار الرئيسية بسرعة من المستندات المعقدة.</li>
           </ul>
           <h2 id="performance-comparison">مقارنة الأداء</h2>
           <p>وفقًا لدراساتنا الداخلية، يمكن لمستخدمي <strong>ChatPDF</strong> العثور على معلومات محددة في المستندات بسرعة أكبر 5 مرات من الطرق التقليدية. هذا يترجم إلى توفير وقت كبير خاصة للمهنيين مثل المحامين والباحثين والطلاب.</p>
           <p>للمحامين على وجه الخصوص، يمكن أن يكون هذا أداة لا تقدر بثمن. اكتشف المزيد في مقالنا حول <a href="/blog/chatpdf-legal" class="text-primary hover:underline">ChatPDF للمحامين</a>.</p>
           <h2 id="conclusion">الخلاصة</h2>
           <p>في عالم يتزايد فيه حجم المعلومات باستمرار، تعد أدوات مثل <strong>ChatPDF</strong> ضرورية لمساعدتنا على البقاء منتجين وفعالين. من خلال دمج الذكاء الاصطناعي مع تنسيق PDF الشائع، يوفر ChatPDF حلاً مبتكرًا للتحديات القديمة في استخراج المعلومات.</p>
           <p>جرب <strong>ChatPDF</strong> اليوم واكتشف كيف يمكن أن يحول تجربة قراءة PDF الخاصة بك.</p>`
        : `<p>In today's digital age, PDF documents have become an integral part of our professional and personal lives. However, many of us face challenges in quickly extracting relevant information from these documents.</p>
           <p>This is where <strong>ChatPDF</strong> comes in, a revolutionary technology that's changing the way we interact with PDF documents.</p>
           <h2 id="why-traditional-pdf-inefficient">Why Traditional PDF Reading is Inefficient</h2>
           <p>Traditional methods of reading PDFs require scanning through the entire document to find specific information. This is time-consuming and significantly reduces productivity, especially when dealing with lengthy or complex documents.</p>
           <p>For instance, imagine trying to find a specific piece of information in a 100-page report - you'd spend a considerable amount of time scrolling and searching. Read more about <a href="/blog/chatpdf-education" class="text-primary hover:underline">how ChatPDF is transforming education</a> to learn about its impact on academic research.</p>
           <h2 id="how-chatpdf-solves">How ChatPDF Solves This Problem</h2>
           <p><strong>ChatPDF</strong> uses advanced AI to understand the content of your PDF files. Instead of manually searching for information, you can simply ask a question about the document and get an immediate answer.</p>
           <p>This allows users to extract relevant information without having to read the entire document, resulting in a significant productivity boost. You can learn more about using this technology in a workplace setting in our article on <a href="/blog/chatpdf-business" class="text-primary hover:underline">accelerating business processes with ChatPDF</a>.</p>
           <h2 id="benefits">Benefits of Using ChatPDF</h2>
           <ul>
             <li><strong>Time Savings:</strong> Reduce research time by 80%.</li>
             <li><strong>Higher Accuracy:</strong> Get precise answers based on document content.</li>
             <li><strong>Ease of Use:</strong> Simple, intuitive chat interface.</li>
             <li><strong>Better Comprehension:</strong> Quickly extract key insights from complex documents.</li>
           </ul>
           <h2 id="performance-comparison">Performance Comparison</h2>
           <p>According to our internal studies, <strong>ChatPDF</strong> users can find specific information in documents 5x faster than traditional methods. This translates to significant time savings, especially for professionals like lawyers, researchers, and students.</p>
           <p>For lawyers in particular, this can be an invaluable tool. Discover more in our article on <a href="/blog/chatpdf-legal" class="text-primary hover:underline">ChatPDF for lawyers</a>.</p>
           <h2 id="conclusion">Conclusion</h2>
           <p>In a world where the volume of information continues to grow, tools like <strong>ChatPDF</strong> are essential to help us stay productive and efficient. By combining AI with the ubiquitous PDF format, ChatPDF provides an innovative solution to age-old challenges in information extraction.</p>
           <p>Try <strong>ChatPDF</strong> today and discover how it can transform your PDF reading experience.</p>`,
      date: '2023-10-15',
      author: language === 'ar' ? 'أحمد الشمري' : 'Emma Johnson',
      readTime: language === 'ar' ? '5 دقائق للقراءة' : '5 min read',
      category: language === 'ar' ? 'تكنولوجيا' : 'Technology',
      image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      tags: language === 'ar' 
        ? ['تكنولوجيا', 'ذكاء اصطناعي', 'PDF', 'إنتاجية'] 
        : ['Technology', 'AI', 'PDF', 'Productivity']
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
           <h2 id="educational-challenges">تحديات التعلم التقليدي مع ملفات PDF</h2>
           <p>غالبًا ما يجد الطلاب صعوبة في استيعاب المعلومات من الكتب المدرسية الطويلة، مما يؤدي إلى:</p>
           <ul>
             <li><strong>إجهاد القراءة والتعب المعرفي</strong></li>
             <li><strong>صعوبة في تحديد الأفكار الرئيسية</strong></li>
             <li><strong>احتفاظ منخفض بالمعلومات</strong></li>
             <li><strong>وقت دراسة غير فعال</strong></li>
           </ul>
           <p>هذه المشكلات مشابهة للصعوبات التي تمت مناقشتها في مقالنا عن <a href="/blog/chatpdf-vs-traditional" class="text-primary hover:underline">ChatPDF مقابل قراءة PDF التقليدية</a>، لكنها تؤثر بشكل خاص على البيئة التعليمية.</p>
           <h2 id="student-benefits">كيف يساعد ChatPDF الطلاب</h2>
           <p>من خلال استخدام <strong>ChatPDF</strong>، يمكن للطلاب:</p>
           <ul>
             <li><strong>طرح أسئلة مباشرة</strong> حول محتوى الكتاب المدرسي</li>
             <li><strong>الحصول على ملخصات فورية</strong> للفصول الطويلة</li>
             <li><strong>فهم المفاهيم المعقدة</strong> من خلال شرح مبسط</li>
             <li><strong>التحقق من فهمهم</strong> من خلال اختبارات تفاعلية</li>
           </ul>
           <p>يمكن للطلاب الاستفادة بشكل كبير من هذه الميزات، خاصة أولئك الذين لديهم أساليب تعلم مختلفة. لمزيد من النصائح العملية، راجع <a href="/blog/chatpdf-student" class="text-primary hover:underline">دليل الطالب لاستخدام ChatPDF للدراسة الفعالة</a>.</p>
           <h2 id="teacher-benefits">فوائد ChatPDF للمعلمين</h2>
           <p>لا يقتصر الأمر على الطلاب، بل يمكن للمعلمين أيضًا الاستفادة من <strong>ChatPDF</strong> من خلال:</p>
           <ul>
             <li><strong>إنشاء مواد تعليمية مخصصة</strong> بسرعة</li>
             <li><strong>تحليل أعمال الطلاب</strong> بشكل أكثر كفاءة</li>
             <li><strong>تقديم ملاحظات أكثر تفصيلاً</strong></li>
             <li><strong>توفير الوقت</strong> في تحضير الدروس</li>
           </ul>
           <p>يمكن دمج هذه الأدوات مع تقنيات الذكاء الاصطناعي الأخرى لتحسين الإنتاجية، كما هو موضح في <a href="/blog/chatpdf-business" class="text-primary hover:underline">مقالنا عن تطبيقات الأعمال</a>.</p>
           <h2 id="case-studies">دراسات حالة في المؤسسات التعليمية</h2>
           <p>أظهرت الاختبارات التجريبية في عدة جامعات أن الطلاب الذين استخدموا <strong>ChatPDF</strong> لدراستهم حققوا درجات أعلى بنسبة 27% في المتوسط ​​مقارنة بطرق الدراسة التقليدية.</p>
           <p>في إحدى المدارس الثانوية، أبلغ المعلمون عن توفير 5-7 ساعات أسبوعيًا في إعداد الدروس بعد دمج <strong>ChatPDF</strong> في سير عملهم.</p>
           <h2 id="future">المستقبل: التعلم الشخصي باستخدام ChatPDF</h2>
           <p>مع تطور الذكاء الاصطناعي، سيصبح <strong>ChatPDF</strong> أكثر قدرة على:</p>
           <ul>
             <li><strong>تخصيص شرح المحتوى</strong> بناءً على أنماط التعلم الفردية</li>
             <li><strong>التنبؤ بالمناطق</strong> التي قد يواجه فيها الطلاب صعوبات</li>
             <li><strong>تكييف المواد التعليمية</strong> وفقًا لمستوى فهم كل طالب</li>
           </ul>
           <p>هذه التطورات ستكمل الابتكارات الأخرى في مجال التكنولوجيا التعليمية، مما يخلق نظامًا بيئيًا أكثر تكاملاً للتعلم الرقمي.</p>
           <h2 id="conclusion">الخلاصة</h2>
           <p>يعد <strong>ChatPDF</strong> أكثر من مجرد أداة تكنولوجية؛ إنه يمثل تحولًا أساسيًا في كيفية تفاعلنا مع المحتوى التعليمي. من خلال جعل المعلومات أكثر سهولة في الوصول إليها وفهمها، فإنه يفتح إمكانيات جديدة للطلاب والمعلمين على حد سواء.</p>
           <p>لمعرفة المزيد عن كيفية استخدام ChatPDF في سياقات أخرى، راجع مقالنا عن <a href="/blog/chatpdf-research" class="text-primary hover:underline">كيف يمكن للباحثين استخدام ChatPDF</a>.</p>`
        : `<p>Students and teachers alike face an ongoing challenge in dealing with vast amounts of educational materials in PDF format. From textbooks to research papers and lecture notes, PDF has become a standard in modern education.</p>
           <p>In this article, we'll explore how <strong>ChatPDF</strong> technology can reshape the way students learn and teachers teach.</p>
           <h2 id="educational-challenges">Challenges of Traditional Learning with PDFs</h2>
           <p>Students often struggle to absorb information from lengthy textbooks, leading to:</p>
           <ul>
             <li><strong>Reading fatigue and cognitive overload</strong></li>
             <li><strong>Difficulty identifying key ideas</strong></li>
             <li><strong>Low information retention</strong></li>
             <li><strong>Inefficient study time</strong></li>
           </ul>
           <p>These issues are similar to the difficulties discussed in our article on <a href="/blog/chatpdf-vs-traditional" class="text-primary hover:underline">ChatPDF vs Traditional PDF Reading</a>, but they specifically impact the educational environment.</p>
           <h2 id="student-benefits">How ChatPDF Helps Students</h2>
           <p>By using <strong>ChatPDF</strong>, students can:</p>
           <ul>
             <li><strong>Ask direct questions</strong> about textbook content</li>
             <li><strong>Get instant summaries</strong> of lengthy chapters</li>
             <li><strong>Understand complex concepts</strong> through simplified explanations</li>
             <li><strong>Test their comprehension</strong> through interactive quizzes</li>
           </ul>
           <p>Students can benefit tremendously from these features, especially those with different learning styles. For more practical tips, check out <a href="/blog/chatpdf-student" class="text-primary hover:underline">The Student's Guide to Using ChatPDF</a>.</p>
           <h2 id="teacher-benefits">Benefits for Teachers</h2>
           <p>Teachers aren't left out - they can also benefit from <strong>ChatPDF</strong> by:</p>
           <ul>
             <li><strong>Creating customized teaching materials</strong> quickly</li>
             <li><strong>Analyzing student work</strong> more efficiently</li>
             <li><strong>Providing more detailed feedback</strong></li>
             <li><strong>Saving time</strong> in lesson preparation</li>
           </ul>
           <p>These tools can be integrated with other AI technologies to enhance productivity, as outlined in our <a href="/blog/chatpdf-business" class="text-primary hover:underline">article on business applications</a>.</p>
           <h2 id="case-studies">Case Studies in Educational Institutions</h2>
           <p>Pilot tests in several universities showed that students who used <strong>ChatPDF</strong> for their studies achieved 27% higher grades on average compared to traditional study methods.</p>
           <p>In one high school, teachers reported saving 5-7 hours weekly in lesson preparation after integrating <strong>ChatPDF</strong> into their workflow.</p>
           <h2 id="future">The Future: Personalized Learning Using ChatPDF</h2>
           <p>As AI evolves, <strong>ChatPDF</strong> will become more capable of:</p>
           <ul>
             <li><strong>Customizing content explanations</strong> based on individual learning patterns</li>
             <li><strong>Predicting areas</strong> where students might struggle</li>
             <li><strong>Adapting teaching materials</strong> according to each student's level of understanding</li>
           </ul>
           <p>These developments will complement other innovations in educational technology, creating a more integrated ecosystem for digital learning.</p>
           <h2 id="conclusion">Conclusion</h2>
           <p><strong>ChatPDF</strong> is more than just a technological tool; it represents a fundamental shift in how we interact with educational content. By making information more accessible and understandable, it opens new possibilities for both students and teachers alike.</p>
           <p>To learn more about how ChatPDF can be used in other contexts, check out our article on <a href="/blog/chatpdf-research" class="text-primary hover:underline">How Researchers Can Use ChatPDF</a>.</p>`,
      date: '2023-11-02',
      author: language === 'ar' ? 'سارة القحطاني' : 'Michael Chen',
      readTime: language === 'ar' ? '7 دقائق للقراءة' : '7 min read',
      category: language === 'ar' ? 'تعليم' : 'Education',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      tags: language === 'ar' 
        ? ['تعليم', 'طلاب', 'تكنولوجيا تعليمية', 'مدرسين'] 
        : ['Education', 'Students', 'EdTech', 'Teachers']
    },
    // Additional blog posts remain the same
  };
  
  return blogPosts[id] || null;
};

const TableOfContents = ({ content }: { content: string }) => {
  const { language } = useLanguage();
  const headingRegex = /<h2 id="([^"]+)"[^>]*>([^<]+)<\/h2>/g;
  
  const headings: { id: string; text: string }[] = [];
  let match;
  
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({ id: match[1], text: match[2] });
  }
  
  if (headings.length === 0) return null;
  
  return (
    <div className="bg-muted/30 p-4 rounded-lg mb-8">
      <h3 className="text-lg font-medium mb-3">
        {language === 'ar' ? 'محتويات المقالة' : 'Table of Contents'}
      </h3>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a 
              href={`#${heading.id}`}
              className="text-primary hover:underline flex items-center"
            >
              <span className="mr-2">•</span>
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const RelatedArticles = ({ currentId, language }: { currentId: string, language: string }) => {
  const relatedPosts = ['chatpdf-vs-traditional', 'chatpdf-education', 'chatpdf-business', 'chatpdf-legal', 'chatpdf-research', 'chatpdf-student']
    .filter(id => id !== currentId)
    .map(id => getBlogPost(id, language))
    .filter(post => post !== null)
    .slice(0, 3) as BlogPostData[];
  
  if (relatedPosts.length === 0) return null;
  
  return (
    <div className="container mx-auto max-w-4xl mt-20 pt-10 border-t">
      <h2 className="heading-3 mb-8">
        {language === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map(related => (
          <Link 
            key={related.id}
            to={`/blog/${related.id}`}
            className="flex flex-col group hover:bg-muted/50 rounded-lg p-4 transition-colors h-full"
          >
            <div className="w-full h-32 rounded-md overflow-hidden mb-4">
              <img 
                src={related.image} 
                alt={related.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <h3 className="font-medium mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {related.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2 flex-grow">
              {related.excerpt}
            </p>
            <div className="text-sm font-medium flex items-center text-primary mt-2">
              {language === 'ar' ? 'قراءة المزيد' : 'Read more'}
              <ArrowLeft className={`h-4 w-4 ${language === 'ar' ? 'mr-1' : 'ml-1'}`} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const BlogPostSkeleton = () => {
  return (
    <div className="container mx-auto max-w-4xl">
      <Skeleton className="h-10 w-3/4 mb-6" />
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-[400px] w-full rounded-2xl mb-10" />
      <div className="space-y-6">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    </div>
  );
};

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setTimeout(() => {
        const fetchedPost = getBlogPost(id, language);
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          navigate('/blog');
        }
        setIsLoading(false);
      }, 300);
    }
  }, [id, language, navigate]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | ChatPDF Blog`;
      
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', post.excerpt);
    }
    
    return () => {
      document.title = 'ChatPDF';
    };
  }, [post]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <article className="pt-32 pb-20 px-4 md:px-6">
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
            <span className="truncate max-w-[200px]">
              {isLoading ? <Skeleton className="h-4 w-24" /> : post?.title}
            </span>
          </div>
        </div>
        
        {isLoading ? (
          <BlogPostSkeleton />
        ) : post ? (
          <>
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
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <Link 
                      key={tag} 
                      to={`/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center text-xs bg-muted rounded-full px-3 py-1 hover:bg-muted/80 transition-colors"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Link>
                  ))}
                </div>
              )}
              
              <div className="flex items-center text-sm text-muted-foreground mb-8">
                <div className="flex items-center mr-4">
                  <User className="h-4 w-4 mr-1" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <div className="rounded-2xl overflow-hidden aspect-[21/9] mb-10">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            </header>
            
            <div className="container mx-auto max-w-3xl">
              <TableOfContents content={post.content} />
            </div>
            
            <div className="container mx-auto max-w-3xl">
              <div 
                className="prose prose-lg max-w-none prose-headings:scroll-mt-20 prose-headings:font-display prose-headings:font-semibold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            
            <RelatedArticles currentId={post.id} language={language} />
          </>
        ) : null}
      </article>
      
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
