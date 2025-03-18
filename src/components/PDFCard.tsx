
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Clock, FileText, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export interface PDF {
  id: string;
  title: string;
  summary: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string;
  thumbnail?: string;
  storageUrl?: string;
  googleViewerUrl?: string;
}

interface PDFCardProps {
  pdf: PDF;
  index: number;
}

const PDFCard = ({ pdf, index }: PDFCardProps) => {
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

  // Determine the thumbnail to display
  const renderThumbnail = () => {
    if (pdf.thumbnail) {
      // If there's a specific thumbnail, use it
      return (
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
      );
    } else if (pdf.googleViewerUrl || pdf.storageUrl) {
      // If there's a Google Docs viewer URL or storage URL, use an iframe preview
      return (
        <div className="w-full h-full relative overflow-hidden bg-white">
          <iframe 
            src={pdf.googleViewerUrl || `https://docs.google.com/viewer?url=${encodeURIComponent(pdf.storageUrl || '')}&embedded=true`}
            className="w-full h-full border-0 transform scale-[1.05] origin-top-left"
            title={`PDF Preview: ${pdf.title}`}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
          />
          <div className="absolute inset-0 bg-transparent pointer-events-none" />
        </div>
      );
    } else {
      // Fallback to the icon
      return (
        <div className="flex items-center justify-center h-full">
          <FileText className="h-20 w-20 text-muted-foreground/50" />
        </div>
      );
    }
  };

  return (
    <Link 
      to={`/pdf/${pdf.id}`}
      id={`pdf-card-${pdf.id}`}
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden bg-card border border-border/40 shadow-sm hover:shadow-md transition-all duration-300 h-full hover-lift',
        isInView ? 'animate-fade-in opacity-100' : 'opacity-0'
      )}
      style={{ animationDelay }}
      aria-label={`Open PDF document: ${pdf.title}`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
        {renderThumbnail()}
        
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
  );
};

export default PDFCard;
