
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PDFPreview from '@/components/PDFPreview';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getPDFById } from '@/services/pdfManagementService';
import { SupabasePDF } from '@/services/pdfTypes';

function PDFViewer() {
  const { id } = useParams<{ id: string }>();
  const [pdf, setPdf] = useState<SupabasePDF | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, direction } = useLanguage();
  const { user } = useAuth();
  
  // Translation states
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadPDF = async () => {
      if (!id) return;
      
      try {
        const pdfData = await getPDFById(id);
        setPdf(pdfData);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError(language === 'ar' ? 'فشل في تحميل ملف PDF' : 'Failed to load PDF');
      } finally {
        setLoading(false);
      }
    };
    
    loadPDF();
  }, [id, language]);

  // Handler to track current page
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="container mx-auto px-4 py-6" dir={direction}>
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          <p className="text-lg font-medium">{error}</p>
        </div>
      ) : pdf ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className={cn(
                  "flex items-center gap-1", 
                  direction === 'rtl' ? "flex-row-reverse" : ""
                )}
              >
                <Link to="/pdfs">
                  <ArrowLeft className={cn("h-4 w-4", direction === 'rtl' && "rotate-180")} />
                  {language === 'ar' ? 'العودة إلى قائمة الملفات' : 'Back to PDFs'}
                </Link>
              </Button>
            </div>
            
            <h1 className="text-2xl font-bold">{pdf.title}</h1>
          </div>
          
          <div className="bg-card rounded-lg shadow p-4 sm:p-6">
            {pdf.fileUrl ? (
              <PDFPreview 
                pdfUrl={pdf.fileUrl} 
                maxHeight={700}
                onPageChange={handlePageChange} 
              />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {language === 'ar' ? 'عذراً، لا يمكن عرض هذا الملف' : 'Sorry, this PDF cannot be displayed'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-8">
          {language === 'ar' ? 'عذراً، لم يتم العثور على الملف' : 'Sorry, PDF not found'}
        </div>
      )}
    </div>
  );
}

export default PDFViewer;
