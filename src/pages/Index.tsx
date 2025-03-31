
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import BlogSection from '@/components/BlogSection';
import FAQSection from '@/components/FAQSection';
import UploadZone from '@/components/UploadZone';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { getSavedPDFs } from '@/services/pdfStorage';
import { getUserPDFs, SupabasePDF } from '@/services/pdfSupabaseService';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PDFCard from '@/components/PDFCard';

const Index = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [userPDFs, setUserPDFs] = useState<SupabasePDF[]>([]);
  const [localPDFs, setLocalPDFs] = useState(getSavedPDFs().slice(0, 6));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load PDFs
    if (user) {
      setIsLoading(true);
      getUserPDFs(user.id)
        .then(pdfs => {
          setUserPDFs(pdfs.slice(0, 6)); // Show only first 6 PDFs
        })
        .catch(error => {
          console.error('Error fetching PDFs:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setLocalPDFs(getSavedPDFs().slice(0, 6));
    }
  }, [user, language]);

  const pdfsToDisplay = user ? userPDFs : localPDFs;
  const hasPDFs = pdfsToDisplay.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background via-muted/5">
      <Navbar />

      <main>
        <HeroSection />
        
        {/* Upload Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-7xl">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                {language === 'ar' ? 'تحميل ملف PDF الخاص بك' : 'Upload Your PDF'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                {language === 'ar'
                  ? 'قم بتحميل مستند PDF وابدأ التحدث معه فورًا. يمكنك طرح الأسئلة واستخراج المعلومات بسهولة.'
                  : 'Upload a PDF document and start chatting with it instantly. Ask questions and extract information with ease.'
                }
              </p>
            </div>
            
            <UploadZone />
          </div>
        </section>
        
        {/* PDFs Grid Section */}
        <section className="py-16 px-4 md:px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">
                  {language === 'ar' ? 'ملفات PDF الخاصة بك' : 'Your PDFs'}
                </h2>
                <p className="text-muted-foreground">
                  {language === 'ar'
                    ? 'تصفح ملفات PDF الخاصة بك والتفاعل معها'
                    : 'Browse your PDF documents and interact with them'}
                </p>
              </div>
              
              <Button asChild variant="outline" className="mt-4 md:mt-0">
                <Link to="/pdfs">
                  {language === 'ar' ? 'عرض جميع الملفات' : 'View All PDFs'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : hasPDFs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {pdfsToDisplay.map((pdf, index) => (
                  <PDFCard 
                    key={pdf.id} 
                    pdf={pdf} 
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-muted/10 rounded-lg border border-border/40">
                <div className="flex justify-center">
                  <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {language === 'ar' ? 'لا توجد ملفات PDF حتى الآن' : 'No PDFs Yet'}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {language === 'ar'
                    ? 'ابدأ بتحميل ملف PDF للتفاعل معه. يمكنك طرح الأسئلة واستخراج المعلومات بسهولة.'
                    : 'Start by uploading a PDF to interact with it. You can ask questions and extract information with ease.'}
                </p>
                <Button asChild>
                  <Link to="/pdfs">
                    {language === 'ar' ? 'استكشاف المزيد' : 'Explore More'}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>
        
        <FeaturesSection />
        <BlogSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
