
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Clock, FileText, MessageSquare, Download, Trash2, History, FileText as Summarize, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { deletePDF } from '@/services/pdfSupabaseService';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

export interface PDF {
  id: string;
  title: string;
  summary: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string;
  thumbnail?: string;
}

interface PDFCardProps {
  pdf: PDF;
  index: number;
  onDelete?: (id: string) => void;
}

const PDFCard = ({ pdf, index, onDelete }: PDFCardProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const { language } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`pdf-card-${pdf.id}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [pdf.id]);

  // Add a staggered animation delay based on the index
  const animationDelay = `${index * 100}ms`;

  // Check if this is an uploaded PDF with chat messages
  const hasChatMessages = 'chatMessages' in pdf && Array.isArray((pdf as any).chatMessages) && (pdf as any).chatMessages.length > 0;

  // Handle PDF deletion
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا الملف؟' : 'Are you sure you want to delete this PDF?')) {
      try {
        const success = await deletePDF(pdf.id);
        if (success) {
          toast.success(language === 'ar' ? 'تم حذف الملف بنجاح' : 'PDF deleted successfully');
          if (onDelete) {
            onDelete(pdf.id);
          }
        }
      } catch (error) {
        console.error('Error deleting PDF:', error);
        toast.error(language === 'ar' ? 'فشل في حذف الملف' : 'Failed to delete PDF');
      }
    }
  };

  // Handle PDF download
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if PDF has a fileUrl
    if ('fileUrl' in pdf && (pdf as any).fileUrl) {
      const fileUrl = (pdf as any).fileUrl;
      
      try {
        // Create an anchor element and trigger download
        const a = document.createElement('a');
        a.href = fileUrl;
        a.download = pdf.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast.success(language === 'ar' ? 'جارٍ تنزيل الملف...' : 'Downloading PDF...');
      } catch (error) {
        console.error('Error downloading PDF:', error);
        toast.error(language === 'ar' ? 'فشل في تنزيل الملف' : 'Failed to download PDF');
      }
    } else {
      toast.error(language === 'ar' ? 'رابط الملف غير متوفر' : 'File URL not available');
    }
  };
  
  // Navigate to PDF history
  const viewHistory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Navigate to PDF history page (will be implemented in the future)
    toast.info(language === 'ar' ? 'سيتم تنفيذ هذه الميزة قريبًا' : 'This feature will be implemented soon');
    // You would typically navigate like: window.location.href = `/pdf/${pdf.id}/history`;
  };
  
  // Generate summary for PDF
  const generateSummary = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Generate summary (will be implemented in the future)
    toast.info(language === 'ar' ? 'سيتم تنفيذ هذه الميزة قريبًا' : 'This feature will be implemented soon');
    // You would typically navigate like: window.location.href = `/pdf/${pdf.id}/summarize`;
  };
  
  // Translate PDF
  const translatePDF = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Translate PDF (will be implemented in the future)
    toast.info(language === 'ar' ? 'سيتم تنفيذ هذه الميزة قريبًا' : 'This feature will be implemented soon');
    // You would typically navigate like: window.location.href = `/pdf/${pdf.id}/translate`;
  };

  return (
    <Card 
      id={`pdf-card-${pdf.id}`}
      className={cn(
        'group relative flex flex-col overflow-hidden h-full hover-lift',
        isInView ? 'animate-fade-in opacity-100' : 'opacity-0'
      )}
      style={{ animationDelay }}
    >
      <Link 
        to={`/pdf/${pdf.id}`}
        className="flex-1 flex flex-col"
        aria-label={`Open ChatPDF document: ${pdf.title}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
          {pdf.thumbnail ? (
            <>
              <div 
                className={cn(
                  "absolute inset-0 bg-muted/20 backdrop-blur-sm transition-opacity duration-500",
                  isLoaded ? "opacity-0" : "opacity-100"
                )}
              />
              <img
                src={pdf.thumbnail}
                alt={language === 'ar' ? `صورة مصغرة لـ ${pdf.title}` : `ChatPDF thumbnail for ${pdf.title}`}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onLoad={() => setIsLoaded(true)}
                loading="lazy"
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-20 w-20 text-muted-foreground/50" />
            </div>
          )}
          
          {hasChatMessages && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {language === 'ar' ? 'مع محادثة' : 'Has Chat'}
            </div>
          )}
        </div>
        
        <CardContent className="flex-1 p-4">
          <h3 className="font-display font-medium text-lg leading-tight mb-2 group-hover:text-foreground/80 transition-colors">
            {pdf.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 flex-grow">
            {pdf.summary}
          </p>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{pdf.uploadDate}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {pdf.pageCount} {language === 'ar' ? 'صفحات' : 'pages'}
            </span>
          </div>
        </CardContent>
      </Link>
      
      <CardFooter className="flex flex-wrap gap-2 p-3 pt-0 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 rounded-md flex-1"
          onClick={handleDownload}
        >
          <Download className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {language === 'ar' ? 'تنزيل' : 'Download'}
          </span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 rounded-md flex-1"
          onClick={viewHistory}
        >
          <History className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {language === 'ar' ? 'السجل' : 'History'}
          </span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 rounded-md flex-1"
          onClick={generateSummary}
        >
          <Summarize className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {language === 'ar' ? 'تلخيص' : 'Summary'}
          </span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 rounded-md flex-1"
          onClick={translatePDF}
        >
          <Languages className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {language === 'ar' ? 'ترجمة' : 'Translate'}
          </span>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive flex-1"
          onClick={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          <span className="text-xs">
            {language === 'ar' ? 'حذف' : 'Delete'}
          </span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PDFCard;
