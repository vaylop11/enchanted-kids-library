
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { pdfs } from '@/data/pdfs';
import { getUserPDFs } from '@/services/pdfSupabaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Grid3X3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import PDFCard from '@/components/PDFCard';

const PDFGrid = () => {
  const [allPDFs, setAllPDFs] = useState(pdfs);
  const { language } = useLanguage();
  const { user } = useAuth();

  useEffect(() => {
    const loadPDFs = async () => {
      if (user) {
        try {
          const userPDFs = await getUserPDFs(user.id);
          setAllPDFs(userPDFs);
        } catch (error) {
          console.error('Error loading user PDFs:', error);
        }
      }
    };

    loadPDFs();
  }, [user]);

  // Don't render anything if user is not signed in
  if (!user) {
    return null;
  }

  // Don't render if there are no PDFs
  if (allPDFs.length === 0) {
    return null;
  }

  return (
    <section className="py-16 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              {language === 'ar' ? 'مكتبة ملفات PDF' : 'PDF Library'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'استعرض وتصفح جميع ملفات PDF المتاحة'
                : 'Browse and explore all available PDF documents'}
            </p>
          </div>
          
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link to="/pdfs">
              {language === 'ar' ? 'عرض جميع الملفات' : 'View All PDFs'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="relative">
          <ScrollArea className="w-full pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 min-w-max pr-4">
              {allPDFs.map((pdf, index) => (
                <div key={pdf.id} className="w-[280px]">
                  <PDFCard pdf={pdf} index={index} />
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gap-2">
            <Link to="/pdfs">
              <Grid3X3 className="h-5 w-5" />
              {language === 'ar' ? 'عرض جميع ملفات PDF' : 'View All PDFs'}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PDFGrid;
