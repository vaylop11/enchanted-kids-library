
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            className="mb-6 group hover:bg-muted/50"
            asChild
          >
            <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              {language === 'ar' ? 'العودة إلى الرئيسية' : 'Back to Home'}
            </Link>
          </Button>
          
          <h1 className="heading-1 mb-8 text-center font-bold text-4xl md:text-5xl tracking-tight">
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            {language === 'ar' ? (
              <>
                <p className="text-muted-foreground text-center mb-10">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">١. المقدمة</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">مرحبًا بكم في ChatPDF ("نحن"، "لنا"، "خدمتنا"). نلتزم بحماية خصوصيتك وضمان أمان معلوماتك الشخصية. تصف سياسة الخصوصية هذه كيفية جمعنا واستخدامنا وحمايتنا لمعلوماتك عند استخدام تطبيقنا.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٢. المعلومات التي نجمعها</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">نحن نجمع نوعين من المعلومات:</p>
                <ul className="list-disc pl-8 mb-6 space-y-3">
                  <li className="text-lg"><strong className="font-semibold">المعلومات الشخصية:</strong> قد تتضمن هذه اسمك وعنوان بريدك الإلكتروني ورقم هاتفك، وهي معلومات تقدمها لنا طواعيةً.</li>
                  <li className="text-lg"><strong className="font-semibold">بيانات الاستخدام:</strong> نجمع تلقائيًا معلومات حول كيفية تفاعلك مع تطبيقنا، مثل عنوان IP الخاص بك ونوع المتصفح والصفحات التي تزورها ووقت الزيارة.</li>
                </ul>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٣. كيف نستخدم معلوماتك</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">نستخدم المعلومات التي نجمعها للأغراض التالية:</p>
                <ul className="list-disc pl-8 mb-6 space-y-3">
                  <li className="text-lg">تقديم وصيانة وتحسين خدماتنا</li>
                  <li className="text-lg">فهم كيفية استخدام المستخدمين لتطبيقنا</li>
                  <li className="text-lg">تطوير خدمات ومنتجات جديدة</li>
                  <li className="text-lg">التواصل معك، بما في ذلك تقديم تحديثات الخدمة والعروض</li>
                </ul>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٤. أمان البيانات</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">أمان معلوماتك مهم بالنسبة لنا. نتبع معايير الصناعة لحماية المعلومات المقدمة ضد الفقدان أو السرقة، بالإضافة إلى الوصول غير المصرح به أو الإفصاح أو النسخ أو الاستخدام أو التعديل.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٥. مشاركة المعلومات</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">لن نبيع أو نؤجر أو نتاجر بمعلوماتك الشخصية مع أطراف ثالثة. قد نشارك معلوماتك في الظروف التالية:</p>
                <ul className="list-disc pl-8 mb-6 space-y-3">
                  <li className="text-lg">مع مقدمي الخدمات الذين يساعدوننا في تشغيل تطبيقنا</li>
                  <li className="text-lg">عندما يكون ذلك مطلوبًا بموجب القانون</li>
                  <li className="text-lg">لحماية حقوقنا أو ممتلكاتنا</li>
                </ul>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٦. حقوقك</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">لديك الحق في الوصول إلى معلوماتك الشخصية التي نحتفظ بها وطلب تصحيحها أو حذفها. يمكنك أيضًا الاعتراض على معالجة معلوماتك أو طلب تقييدها.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٧. التغييرات على سياسة الخصوصية</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">قد نقوم بتحديث سياسة الخصوصية هذه من وقت لآخر. سنخطرك بأي تغييرات مهمة من خلال نشر السياسة الجديدة على هذه الصفحة.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">٨. اتصل بنا</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا عبر البريد الإلكتروني: privacy@chatpdf.com</p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-center mb-10">Last updated: {new Date().toLocaleDateString('en-US')}</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">1. Introduction</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">Welcome to ChatPDF ("we," "us," "our"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, and protect your information when you use our application.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">2. Information We Collect</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">We collect two types of information:</p>
                <ul className="list-disc pl-8 mb-6 space-y-3">
                  <li className="text-lg"><strong className="font-semibold">Personal Information:</strong> This may include your name, email address, and phone number, which you voluntarily provide to us.</li>
                  <li className="text-lg"><strong className="font-semibold">Usage Data:</strong> We automatically collect information about how you interact with our application, such as your IP address, browser type, pages you visit, and the time of visit.</li>
                </ul>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">3. How We Use Your Information</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">We use the information we collect for the following purposes:</p>
                <ul className="list-disc pl-8 mb-6 space-y-3">
                  <li className="text-lg">To provide, maintain, and improve our services</li>
                  <li className="text-lg">To understand how users use our application</li>
                  <li className="text-lg">To develop new services and products</li>
                  <li className="text-lg">To communicate with you, including providing service updates and offers</li>
                </ul>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">4. Data Security</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">The security of your information is important to us. We follow industry standards to protect the information submitted to us against loss, theft, and unauthorized access, disclosure, copying, use, or modification.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">5. Information Sharing</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">We will not sell, rent, or trade your personal information with third parties. We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-8 mb-6 space-y-3">
                  <li className="text-lg">With service providers who help us operate our application</li>
                  <li className="text-lg">When required by law</li>
                  <li className="text-lg">To protect our rights or property</li>
                </ul>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">6. Your Rights</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">You have the right to access your personal information that we hold and to request that it be corrected or deleted. You can also object to the processing of your information or request that it be restricted.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">7. Changes to the Privacy Policy</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page.</p>
                
                <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-primary border-b pb-2">8. Contact Us</h2>
                <p className="text-lg leading-relaxed mb-6 text-foreground/90">If you have any questions about this Privacy Policy, please contact us at privacy@chatpdf.com</p>
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
