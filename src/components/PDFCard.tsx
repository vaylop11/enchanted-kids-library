import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Clock, FileText, MessageSquare, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
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
  index?: number;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onPreview?: (url: string) => void;
}

const PDFCard = ({ pdf, index = 0, onDelete, onView, onPreview }: PDFCardProps) => {
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

  const animationDelay = `${index * 100}ms`;

  const hasChatMessages = 'chatMessages' in pdf && Array.isArray((pdf as any).chatMessages) && (pdf as any).chatMessages.length > 0;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا الملف؟' : 'Are you sure you want to delete this PDF?')) {
      if (onDelete) {
        onDelete(pdf.id);
      }
    }
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onView) {
      onView(pdf.id);
    }
  };

  const handlePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPreview && 'fileUrl' in (pdf as any)) {
      onPreview((pdf as any).fileUrl);
    } else if (onPreview && 'dataUrl' in (pdf as any)) {
      onPreview((pdf as any).dataUrl);
    }
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
        onClick={handleView}
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
      
      <CardFooter className="flex p-3 pt-0 border-t">
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 px-2 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive w-full"
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
