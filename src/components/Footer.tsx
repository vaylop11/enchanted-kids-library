import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language, direction } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border py-10" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        {language === 'ar' ? 'تذييل الصفحة' : 'Footer'}
      </h2>
      
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link 
              to="/" 
              className="flex items-center transition-opacity hover:opacity-80" 
              style={{ gap: '0.5rem' }}
              aria-label={language === 'ar' ? 'الصفحة الرئيسية لتشات PDF' : 'ChatPDF Home'}
            >
              <img 
                src="https://nknrkkzegbrkqtutmafo.supabase.co/storage/v1/object/sign/img/LOGO3D.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85YWQzN2RiZS1kZTE3LTRhNWMtOGNkYi1hOGZlOTE2NjAzYjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWcvTE9HTzNELnBuZyIsImlhdCI6MTc1NzQ0NTg5NiwiZXhwIjo0ODc5NTA5ODk2fQ.91P5aCD-EqbNngqdYhlhNPEdJMTa6Ppm-5h0wK1izCY" 
                alt={language === 'ar' ? 'شعار تشات PDF' : 'ChatPDF Logo'} 
                className="h-8 w-auto object-contain"
              />
              <span className="font-display text-lg font-medium">
                {language === 'ar' ? 'تشات PDF' : 'ChatPDF'}
              </span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              {language === 'ar'
                ? 'تشات PDF هي منصة مبتكرة تمكنك من التفاعل مع ملفات PDF الخاصة بك بطريقة ذكية وسهلة.'
                : 'ChatPDF is an innovative platform that allows you to interact with your PDF files in a smart and easy way.'}
            </p>
          </div>
          
          <nav className={`grid grid-cols-2 gap-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`} aria-label={language === 'ar' ? 'روابط تذييل الصفحة' : 'Footer navigation'}>
            <div>
              <h3 className="text-sm font-medium mb-3" id="footer-explore">
                {language === 'ar' ? 'استكشف' : 'Explore'}
              </h3>
              <ul className="space-y-2" aria-labelledby="footer-explore">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </Link>
                </li>
                <li>
                  <Link to="/pdfs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {language === 'ar' ? 'ملفات PDF' : 'PDFs'}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3" id="footer-legal">
                {language === 'ar' ? 'قانوني' : 'Legal'}
              </h3>
              <ul className="space-y-2" aria-labelledby="footer-legal">
                <li>
                  <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        
        <div className="mt-8 pt-4 border-t border-border/50 text-center text-sm text-muted-foreground">
          <p>
            {language === 'ar'
              ? `© ${currentYear} تشات PDF. جميع الحقوق محفوظة.`
              : `© ${currentYear} ChatPDF. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
