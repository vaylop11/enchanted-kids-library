
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getUserPDFs } from '@/services/pdfManagementService';
import { SupabasePDF } from '@/services/pdfTypes';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import PDFCard from '@/components/PDFCard';

const PDFLibrarySection = () => {
  const [pdfs, setPdfs] = useState<SupabasePDF[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    const fetchPDFs = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const fetchedPDFs = await getUserPDFs(user.id);
        setPdfs(fetchedPDFs);
      } catch (error) {
        console.error('Error fetching PDFs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, [user]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!user || pdfs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 border-t border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {language === 'ar' ? 'مكتبة ملفات PDF الخاصة بك' : 'Your PDF Library'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar' 
                ? 'جميع ملفات PDF التي قمت بتحميلها. يمكنك الوصول إليها في أي وقت.' 
                : 'All the PDFs you have uploaded. Access them anytime.'}
            </p>
          </div>
          
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link to="/pdfs">
              {language === 'ar' ? 'عرض جميع الملفات' : 'View All PDFs'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {pdfs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.slice(0, 6).map((pdf, index) => (
              <PDFCard key={pdf.id} pdf={pdf} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-muted/10 rounded-lg border border-border/40 p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium mb-2">
              {language === 'ar' ? 'لا توجد ملفات PDF' : 'No PDFs Found'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'ar' 
                ? 'لم تقم بتحميل أي ملفات PDF بعد. قم بتحميل أول ملف الآن!' 
                : 'You haven\'t uploaded any PDFs yet. Upload your first one now!'}
            </p>
            <Button asChild>
              <Link to="/pdfs">
                {language === 'ar' ? 'تحميل ملف PDF' : 'Upload a PDF'}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PDFLibrarySection;
