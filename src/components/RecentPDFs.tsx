
import { useEffect, useState } from 'react';
import { getSavedPDFs } from '@/services/pdfStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { File, Clock, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PDFCard from '@/components/PDFCard';

const RecentPDFs = () => {
  const [recentPDFs, setRecentPDFs] = useState(getSavedPDFs().slice(0, 3));
  const { language } = useLanguage();

  const loadRecentPDFs = () => {
    setRecentPDFs(getSavedPDFs().slice(0, 3));
  };

  useEffect(() => {
    // Update PDFs when component mounts or language changes
    loadRecentPDFs();
  }, [language]);

  // Handle PDF deletion
  const handlePDFDelete = (deletedPdfId: string) => {
    setRecentPDFs(prevPdfs => prevPdfs.filter(pdf => pdf.id !== deletedPdfId));
  };

  if (recentPDFs.length === 0) {
    return null; // Don't render anything if no PDFs
  }

  return (
    <section className="py-16 px-4 md:px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div>
            <h2 className="heading-2 mb-2">
              {language === 'ar' ? 'آخر ملفات PDF الخاصة بك' : 'Your Recent PDFs'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'ar'
                ? 'استمر في قراءة المستندات التي تعمل عليها'
                : 'Continue reading documents you\'ve been working with'}
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
          {recentPDFs.map((pdf, index) => (
            <PDFCard key={pdf.id} pdf={pdf} index={index} onDelete={handlePDFDelete} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentPDFs;
