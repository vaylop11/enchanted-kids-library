
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { getUserPDFs, SupabasePDF } from '@/services/pdfSupabaseService';
import { FileText, Upload, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import PDFCard from '@/components/PDFCard';

const PDFGrid = () => {
  const { user } = useAuth();
  const [pdfs, setPdfs] = useState<SupabasePDF[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchPDFs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const fetchedPdfs = await getUserPDFs(user.id);
        setPdfs(fetchedPdfs);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, [user]);

  // If not logged in, show a message to sign in
  if (!user) {
    return (
      <section className="py-16 bg-muted/10 border-t border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {language === 'ar' ? 'ملفات PDF' : 'Your PDFs'}
            </h2>
            <p className="text-muted-foreground max-w-3xl mb-6">
              {language === 'ar' 
                ? 'قم بتسجيل الدخول لعرض وإدارة ملفات PDF الخاصة بك.'
                : 'Sign in to view and manage your PDF files.'}
            </p>
            <Button asChild>
              <Link to="/signin">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // If loading, show a loading spinner
  if (loading) {
    return (
      <section className="py-16 bg-muted/10 border-t border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {language === 'ar' ? 'ملفات PDF الخاصة بك' : 'Your PDFs'}
            </h2>
          </div>
          <div className="flex justify-center items-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  // If there are no PDFs, show a message to upload
  if (pdfs.length === 0) {
    return (
      <section className="py-16 bg-muted/10 border-t border-b border-border/40">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {language === 'ar' ? 'ملفات PDF الخاصة بك' : 'Your PDFs'}
            </h2>
            <p className="text-muted-foreground max-w-3xl mb-6">
              {language === 'ar' 
                ? 'لم يتم العثور على أي ملفات PDF. قم بتحميل ملف PDF الآن.'
                : 'No PDFs found. Upload a PDF file to get started.'}
            </p>
            <Button asChild>
              <Link to="/pdfs">
                <Upload className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'تحميل ملف PDF' : 'Upload PDF'}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Show the list of PDFs
  return (
    <section className="py-16 bg-muted/10 border-t border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              {language === 'ar' ? 'ملفات PDF الخاصة بك' : 'Your PDFs'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'استعرض ملفات PDF التي قمت بتحميلها.'
                : 'Browse the PDF files you have uploaded.'}
            </p>
          </div>
          
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link to="/pdfs">
              {language === 'ar' ? 'عرض جميع الملفات' : 'View All PDFs'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.slice(0, 6).map((pdf, index) => (
            <PDFCard 
              key={pdf.id} 
              pdf={pdf} 
              index={index}
            />
          ))}
        </div>
        
        {pdfs.length > 6 && (
          <div className="mt-8 text-center">
            <Button asChild variant="outline">
              <Link to="/pdfs">
                {language === 'ar' ? 'عرض المزيد من الملفات' : 'View More PDFs'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PDFGrid;
