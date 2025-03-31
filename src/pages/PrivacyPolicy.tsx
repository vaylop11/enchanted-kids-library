
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="heading-1 mb-8">
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            {language === 'ar' ? (
              <>
                <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
                
                <h2>١. المقدمة</h2>
                <p>مرحبًا بكم في ChatPDF ("نحن"، "لنا"، "خدمتنا"). نلتزم بحماية خصوصيتك وضمان أمان معلوماتك الشخصية. تصف سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام تطبيقنا.</p>
                
                <h2>٢. المعلومات التي نجمعها</h2>
                <p>نحن نجمع نوعين من المعلومات:</p>
                <ul>
                  <li><strong>المعلومات الشخصية:</strong> قد تتضمن هذه اسمك وعنوان بريدك الإلكتروني ورقم هاتفك، وهي معلومات تقدمها لنا طواعيةً.</li>
                  <li><strong>بيانات الاستخدام:</strong> نجمع تلقائيًا معلومات حول كيفية تفاعلك مع تطبيقنا، مثل عنوان IP الخاص بك ونوع المتصفح والصفحات التي تزورها ووقت الزيارة.</li>
                </ul>
                
                <h2>٣. كيف نستخدم معلوماتك</h2>
                <p>نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul>
                  <li>تقديم وصيانة وتحسين خدماتنا</li>
                  <li>فهم كيفية استخدام المستخدمين لتطبيقنا</li>
                  <li>تطوير خدمات ومنتجات جديدة</li>
                  <li>التواصل معك، بما في ذلك تقديم تحديثات الخدمة والعروض</li>
                </ul>
                
                <h2>٤. أمان البيانات</h2>
                <p>أمان معلوماتك مهم بالنسبة لنا. نتبع معايير الصناعة لحماية المعلومات المقدمة ضد الفقدان أو السرقة، بالإضافة إلى الوصول غير المصرح به أو الإفصاح أو النسخ أو الاستخدام أو التعديل.</p>
                
                <h2>٥. مشاركة المعلومات</h2>
                <p>لن نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك معلوماتك في الظروف التالية:</p>
                <ul>
                  <li>مع مقدمي الخدمات الذين يساعدوننا في تشغيل تطبيقنا</li>
                  <li>عندما يكون ذلك مطلوبًا بموجب القانون</li>
                  <li>لحماية حقوقنا أو ممتلكاتنا</li>
                </ul>
                
                <h2>٦. حقوقك</h2>
                <p>لديك الحق في الوصول إلى معلوماتك الشخصية التي نحتفظ بها وطلب تصحيحها أو حذفها. يمكنك أيضًا الاعتراض على معالجة معلوماتك أو طلب تقييدها.</p>
                
                <h2>٧. التغييرات على سياسة الخصوصية</h2>
                <p>قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات مهمة من خلال نشر السياسة الجديدة على هذه الصفحة.</p>
                
                <h2>٨. اتصل بنا</h2>
                <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر البريد الإلكتروني: privacy@chatpdf.com</p>
              </>
            ) : (
              <>
                <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>
                
                <h2>1. Introduction</h2>
                <p>Welcome to ChatPDF ("we," "us," "our"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, and protect your information when you use our application.</p>
                
                <h2>2. Information We Collect</h2>
                <p>We collect two types of information:</p>
                <ul>
                  <li><strong>Personal Information:</strong> This may include your name, email address, and phone number, which you voluntarily provide to us.</li>
                  <li><strong>Usage Data:</strong> We automatically collect information about how you interact with our application, such as your IP address, browser type, pages you visit, and the time of visit.</li>
                </ul>
                
                <h2>3. How We Use Your Information</h2>
                <p>We use the information we collect for the following purposes:</p>
                <ul>
                  <li>To provide, maintain, and improve our services</li>
                  <li>To understand how users use our application</li>
                  <li>To develop new services and products</li>
                  <li>To communicate with you, including providing service updates and offers</li>
                </ul>
                
                <h2>4. Data Security</h2>
                <p>The security of your information is important to us. We follow industry standards to protect the information submitted to us against loss, theft, and unauthorized access, disclosure, copying, use, or modification.</p>
                
                <h2>5. Information Sharing</h2>
                <p>We will not sell, rent, or trade your personal information with third parties. We may share your information in the following circumstances:</p>
                <ul>
                  <li>With service providers who help us operate our application</li>
                  <li>When required by law</li>
                  <li>To protect our rights or property</li>
                </ul>
                
                <h2>6. Your Rights</h2>
                <p>You have the right to access your personal information that we hold and to request that it be corrected or deleted. You can also object to the processing of your information or request that it be restricted.</p>
                
                <h2>7. Changes to the Privacy Policy</h2>
                <p>We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
                
                <h2>8. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at privacy@chatpdf.com</p>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
