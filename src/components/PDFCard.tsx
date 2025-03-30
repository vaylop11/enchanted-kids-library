
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Clock, FileText, MessageSquare, Download, Trash2, History, FileText as Summarize, Languages } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { deletePDF } from '@/services/pdfSupabaseService';
import { toast } from 'sonner';
import { 
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

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
    <ContextMenu>
      <ContextMenuTrigger>
        <Link 
          to={`/pdf/${pdf.id}`}
          id={`pdf-card-${pdf.id}`}
          className={cn(
            'group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 h-full hover-lift',
            isInView ? 'animate-fade-in opacity-100' : 'opacity-0'
          )}
          style={{ animationDelay }}
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
          
          <div className="flex flex-col flex-grow p-4">
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
          </div>
        </Link>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleDownload} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          <span>{language === 'ar' ? 'تنزيل' : 'Download'}</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={generateSummary} className="cursor-pointer">
          <Summarize className="mr-2 h-4 w-4" />
          <span>{language === 'ar' ? 'تلخيص' : 'Summarize'}</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={translatePDF} className="cursor-pointer">
          <Languages className="mr-2 h-4 w-4" />
          <span>{language === 'ar' ? 'ترجمة' : 'Translate'}</span>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={viewHistory} className="cursor-pointer">
          <History className="mr-2 h-4 w-4" />
          <span>{language === 'ar' ? 'السجل' : 'History'}</span>
        </ContextMenuItem>
        
        <ContextMenuSeparator />
        
        <ContextMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          <span>{language === 'ar' ? 'حذف' : 'Delete'}</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default PDFCard;
