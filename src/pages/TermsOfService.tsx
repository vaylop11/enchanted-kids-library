
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';

const TermsOfService = () => {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="heading-1 mb-8">
            {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </h1>
          
          <div className="prose prose-lg max-w-none">
            {language === 'ar' ? (
              <>
                <p>آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
                
                <h2>١. مقدمة</h2>
                <p>مرحبًا بكم في ChatPDF. يرجى قراءة شروط الخدمة هذه بعناية قبل استخدام تطبيقنا. باستخدام الخدمة، فإنك توافق على الالتزام بهذه الشروط.</p>
                
                <h2>٢. استخدام الخدمة</h2>
                <p>أنت توافق على استخدام ChatPDF فقط للأغراض القانونية وبطريقة لا تنتهك حقوق أو تقيد أو تمنع استخدام أي شخص آخر للخدمة. تتضمن الاستخدامات المحظورة:</p>
                <ul>
                  <li>أي نشاط غير قانوني</li>
                  <li>نقل البرامج الضارة</li>
                  <li>محاولة الوصول غير المصرح به إلى أنظمتنا</li>
                  <li>التجميع أو الحصاد الآلي للبيانات من خدمتنا</li>
                </ul>
                
                <h2>٣. حسابك</h2>
                <p>إذا قمت بإنشاء حساب، فأنت مسؤول عن الحفاظ على سرية بيانات اعتماد تسجيل الدخول الخاصة بك وعن جميع الأنشطة التي تحدث تحت حسابك. يجب أن تخطرنا فورًا بأي استخدام غير مصرح به لحسابك.</p>
                
                <h2>٤. الملكية الفكرية</h2>
                <p>جميع حقوق الملكية الفكرية في الخدمة وجميع المواد المنشورة عليها هي ملك لنا أو للجهات المرخصة لنا. هذه الأعمال محمية بموجب قوانين ومعاهدات حقوق النشر في جميع أنحاء العالم.</p>
                
                <h2>٥. المحتوى الذي تقوم بتحميله</h2>
                <p>أنت تحتفظ بجميع حقوق الملكية في المحتوى الذي تقوم بتحميله على ChatPDF. باستخدام خدمتنا، فإنك تمنحنا ترخيصًا غير حصري لاستخدام وتخزين ونسخ هذا المحتوى فقط للأغراض المتعلقة بتقديم وتحسين الخدمة.</p>
                
                <h2>٦. التنصل من الضمانات</h2>
                <p>يتم تقديم ChatPDF "كما هي" دون أي ضمانات، صريحة أو ضمنية. لا نضمن أن الخدمة ستكون آمنة أو خالية من الأخطاء أو متوفرة باستمرار.</p>
                
                <h2>٧. حدود المسؤولية</h2>
                <p>لن نكون مسؤولين عن أي خسارة أو ضرر غير مباشر ينشأ عن استخدامك أو عدم قدرتك على استخدام ChatPDF.</p>
                
                <h2>٨. التغييرات على الشروط</h2>
                <p>قد نقوم بتحديث شروط الخدمة هذه من وقت لآخر. ستصبح التغييرات سارية المفعول بعد نشرها على هذه الصفحة.</p>
                
                <h2>٩. القانون المطبق</h2>
                <p>تخضع هذه الشروط لقوانين الولايات المتحدة وتفسر وفقًا لها.</p>
                
                <h2>١٠. اتصل بنا</h2>
                <p>إذا كان لديك أي أسئلة حول شروط الخدمة هذه، يرجى الاتصال بنا عبر البريد الإلكتروني: terms@chatpdf.com</p>
              </>
            ) : (
              <>
                <p>Last updated: {new Date().toLocaleDateString('en-US')}</p>
                
                <h2>1. Introduction</h2>
                <p>Welcome to ChatPDF. Please read these Terms of Service carefully before using our application. By using the service, you agree to be bound by these terms.</p>
                
                <h2>2. Use of Service</h2>
                <p>You agree to use ChatPDF only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the service. Prohibited uses include:</p>
                <ul>
                  <li>Any unlawful activity</li>
                  <li>Transmitting malicious software</li>
                  <li>Attempting unauthorized access to our systems</li>
                  <li>Automated scraping or harvesting of data from our service</li>
                </ul>
                
                <h2>3. Your Account</h2>
                <p>If you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.</p>
                
                <h2>4. Intellectual Property</h2>
                <p>All intellectual property rights in the service and all material published on it are owned by us or our licensors. These works are protected by copyright laws and treaties around the world.</p>
                
                <h2>5. Content You Upload</h2>
                <p>You retain all ownership rights in the content you upload to ChatPDF. By using our service, you grant us a non-exclusive license to use, store, and copy that content solely for purposes related to providing and improving the service.</p>
                
                <h2>6. Disclaimer of Warranties</h2>
                <p>ChatPDF is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be secure, error-free, or continuously available.</p>
                
                <h2>7. Limitation of Liability</h2>
                <p>We will not be liable for any indirect loss or damage arising from your use of or inability to use ChatPDF.</p>
                
                <h2>8. Changes to Terms</h2>
                <p>We may update these Terms of Service from time to time. Changes will take effect after they have been posted on this page.</p>
                
                <h2>9. Governing Law</h2>
                <p>These terms are governed by and construed in accordance with the laws of the United States.</p>
                
                <h2>10. Contact Us</h2>
                <p>If you have any questions about these Terms of Service, please contact us at terms@chatpdf.com</p>
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
