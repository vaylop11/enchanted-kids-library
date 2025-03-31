
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const TermsOfService = () => {
  const { language, direction } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink>
                  <Link to="/">
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <Link to="/">
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-6"
            >
              <ArrowLeft className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
            </Button>
          </Link>
          
          <h1 className="heading-1 mb-8 font-bold">
            {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            {language === 'ar' ? (
              <>
                <p className="text-muted-foreground text-lg mb-6">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">١. مقدمة</h2>
                <p className="mb-6">مرحبًا بكم في ChatPDF. يرجى قراءة شروط الخدمة هذه بعناية قبل استخدام تطبيقنا. باستخدام الخدمة، فإنك توافق على الالتزام بهذه الشروط.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٢. استخدام الخدمة</h2>
                <p className="mb-4">أنت توافق على استخدام ChatPDF فقط للأغراض القانونية وبطريقة لا تنتهك حقوق أو تقيد أو تمنع استخدام أي شخص آخر للخدمة. تتضمن الاستخدامات المحظورة:</p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                  <li>أي نشاط غير قانوني</li>
                  <li>نقل البرامج الضارة</li>
                  <li>محاولة الوصول غير المصرح به إلى أنظمتنا</li>
                  <li>التجميع أو الحصاد الآلي للبيانات من خدمتنا</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٣. حسابك</h2>
                <p className="mb-6">إذا قمت بإنشاء حساب، فأنت مسؤول عن الحفاظ على سرية بيانات اعتماد تسجيل الدخول الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك. يجب أن تخطرنا فورًا بأي استخدام غير مصرح به لحسابك.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٤. الملكية الفكرية</h2>
                <p className="mb-6">جميع حقوق الملكية الفكرية في الخدمة وجميع المواد المنشورة عليها هي ملك لنا أو للجهات المرخصة لنا. هذه الأعمال محمية بموجب قوانين ومعاهدات حقوق النشر في جميع أنحاء العالم.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٥. المحتوى الذي تقوم بتحميله</h2>
                <p className="mb-6">أنت تحتفظ بجميع حقوق الملكية في المحتوى الذي تقوم بتحميله على ChatPDF. باستخدام خدمتنا، فإنك تمنحنا ترخيصًا غير حصري لاستخدام وتخزين ونسخ هذا المحتوى فقط للأغراض المتعلقة بتقديم وتحسين الخدمة.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٦. التنصل من الضمانات</h2>
                <p className="mb-6">يتم تقديم ChatPDF "كما هي" دون أي ضمانات، صريحة أو ضمنية. لا نضمن أن الخدمة ستكون آمنة أو خالية من الأخطاء أو متوفرة باستمرار.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٧. حدود المسؤولية</h2>
                <p className="mb-6">لن نكون مسؤولين عن أي خسارة أو ضرر غير مباشر ينشأ عن استخدامك أو عدم قدرتك على استخدام ChatPDF.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٨. التغييرات على الشروط</h2>
                <p className="mb-6">قد نقوم بتحديث شروط الخدمة هذه من وقت لآخر. ستصبح التغييرات سارية المفعول بعد نشرها على هذه الصفحة.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">٩. القانون المطبق</h2>
                <p className="mb-6">تخضع هذه الشروط لقوانين الولايات المتحدة وتفسر وفقًا لها.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">١٠. اتصل بنا</h2>
                <p className="mb-6">إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا عبر البريد الإلكتروني: <a href="mailto:terms@chatpdf.com" className="text-primary hover:underline">terms@chatpdf.com</a></p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground text-lg mb-6">Last updated: {new Date().toLocaleDateString('en-US')}</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
                <p className="mb-6">Welcome to ChatPDF. Please read these Terms of Service carefully before using our application. By using the service, you agree to be bound by these terms.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">2. Use of Service</h2>
                <p className="mb-4">You agree to use ChatPDF only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the service. Prohibited uses include:</p>
                <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
                  <li>Any unlawful activity</li>
                  <li>Transmitting malicious software</li>
                  <li>Attempting unauthorized access to our systems</li>
                  <li>Automated scraping or harvesting of data from our service</li>
                </ul>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">3. Your Account</h2>
                <p className="mb-6">If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">4. Intellectual Property</h2>
                <p className="mb-6">All intellectual property rights in the service and all material published on it are owned by us or our licensors. These works are protected by copyright laws and treaties around the world.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">5. Content You Upload</h2>
                <p className="mb-6">You retain all ownership rights in the content you upload to ChatPDF. By using our service, you grant us a non-exclusive license to use, store, and copy that content solely for purposes related to providing and improving the service.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">6. Disclaimer of Warranties</h2>
                <p className="mb-6">ChatPDF is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be secure, error-free, or continuously available.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">7. Limitation of Liability</h2>
                <p className="mb-6">We will not be liable for any indirect loss or damage arising from your use of or inability to use ChatPDF.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">8. Changes to Terms</h2>
                <p className="mb-6">We may update these Terms of Service from time to time. Changes will take effect after they have been posted on this page.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law</h2>
                <p className="mb-6">These terms are governed by and construed in accordance with the laws of the United States.</p>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
                <p className="mb-6">If you have any questions about these Terms of Service, please contact us at <a href="mailto:terms@chatpdf.com" className="text-primary hover:underline">terms@chatpdf.com</a></p>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TermsOfService;
