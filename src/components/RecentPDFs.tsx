import { useEffect, useState } from 'react';
import { getSavedPDFs } from '@/services/pdfStorage';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { File, Clock, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentPDFsProps {
  currentPdfId?: string;
}

const RecentPDFs = ({ currentPdfId }: RecentPDFsProps) => {
  const [recentPDFs, setRecentPDFs] = useState(
    getSavedPDFs()
      .filter(pdf => pdf.id !== currentPdfId)
      .slice(0, 3)
  );
  const { language } = useLanguage();

  useEffect(() => {
    setRecentPDFs(
      getSavedPDFs()
        .filter(pdf => pdf.id !== currentPdfId)
        .slice(0, 3)
    );
  }, [language, currentPdfId]);

  if (recentPDFs.length === 0) {
    return null;
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
            <Link 
              key={pdf.id}
              to={`/pdf/${pdf.id}`}
              className="group block h-full"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Card className="h-full hover:shadow-md transition-all duration-300 hover:-translate-y-1 border-border/60 hover:border-primary/20">
                <CardHeader className="pb-2">
                  <div className="w-full aspect-[3/2] bg-muted/50 rounded-md flex items-center justify-center mb-4 overflow-hidden">
                    {pdf.thumbnail ? (
                      <img 
                        src={pdf.thumbnail} 
                        alt={pdf.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    ) : (
                      <FileText className="h-20 w-20 text-muted-foreground/40" />
                    )}
                  </div>
                  <CardTitle className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
                    {pdf.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{pdf.uploadDate}</span>
                    </div>
                    <div className="flex items-center">
                      <File className="h-3 w-3 mr-1" />
                      <span>{pdf.pageCount} {language === 'ar' ? 'صفحات' : 'pages'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentPDFs;
