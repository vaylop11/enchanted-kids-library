
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { language, direction } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/30 border-t border-border py-10">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <Link 
              to="/" 
              className="flex items-center transition-opacity hover:opacity-80"
              style={{ gap: '0.5rem' }}
              aria-label="ChatPDF Home"
            >
              <BookOpen className="h-5 w-5" />
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
          
          <div className={`grid grid-cols-2 gap-8 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
            <div>
              <h3 className="text-sm font-medium mb-3">{language === 'ar' ? 'استكشف' : 'Explore'}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Go to home page">
                    {language === 'ar' ? 'الرئيسية' : 'Home'}
                  </Link>
                </li>
                <li>
                  <Link to="/pdfs" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Browse PDF documents">
                    {language === 'ar' ? 'ملفات PDF' : 'PDFs'}
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Read our blog articles">
                    {language === 'ar' ? 'المدونة' : 'Blog'}
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-3">{language === 'ar' ? 'قانوني' : 'Legal'}</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Read our privacy policy">
                    {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Read our terms of service">
                    {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
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
