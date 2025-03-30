
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import PDFPreview from '@/components/PDFPreview';
import { Button } from '@/components/ui/button';
import { getUserPDFs, SupabasePDF } from '@/services/pdfSupabaseService';
import { ArrowRight, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const FeaturedPDF = () => {
  const { user } = useAuth();
  const [latestPDF, setLatestPDF] = useState<SupabasePDF | null>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    const fetchLatestPDF = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const pdfs = await getUserPDFs(user.id);
        // Get the most recent PDF
        if (pdfs.length > 0) {
          setLatestPDF(pdfs[0]);
        }
      } catch (error) {
        console.error('Error fetching latest PDF:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPDF();
  }, [user]);

  if (loading) {
    return (
      <section className="py-16 bg-muted/10">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!user || !latestPDF) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/10 border-t border-b border-border/40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            {language === 'ar' ? 'استكمل آخر محادثة' : 'Continue Your Last Conversation'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'استمر في التفاعل مع آخر ملف PDF قمت بتحميله.' 
              : 'Continue interacting with your most recently uploaded PDF.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">{latestPDF.title}</h3>
              <span className="text-xs text-muted-foreground">{latestPDF.uploadDate}</span>
            </div>
            
            {latestPDF.fileUrl ? (
              <PDFPreview pdfUrl={latestPDF.fileUrl} maxHeight={400} />
            ) : (
              <div className="flex items-center justify-center h-64 bg-muted rounded-md">
                <FileText className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
            
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link to={`/pdf/${latestPDF.id}`}>
                  {language === 'ar' ? 'استمر في المحادثة' : 'Continue Conversation'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-4">
              {language === 'ar' ? 'كيف يمكنني الاستفادة؟' : 'How Can I Use This?'}
            </h3>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">
                  {language === 'ar' ? 'استخراج المعلومات' : 'Extract Information'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'اطرح أسئلة محددة حول المحتوى للحصول على معلومات دقيقة.'
                    : 'Ask specific questions about the content to get precise information.'}
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">
                  {language === 'ar' ? 'الملخصات' : 'Summaries'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'اطلب ملخصًا للمستند بأكمله أو لأقسام محددة.'
                    : 'Request a summary of the entire document or specific sections.'}
                </p>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <h4 className="font-medium mb-2">
                  {language === 'ar' ? 'التحليل' : 'Analysis'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar'
                    ? 'اطلب تحليلًا للبيانات أو الأفكار الرئيسية في المستند.'
                    : 'Ask for analysis of data or key ideas in the document.'}
                </p>
              </div>
            </div>
            
            <div className="mt-6">
              <Button variant="outline" asChild className="w-full">
                <Link to="/pdfs">
                  {language === 'ar' ? 'عرض جميع ملفات PDF الخاصة بي' : 'View All My PDFs'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPDF;
