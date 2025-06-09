import React, { useState, useEffect } from 'react';
import { ChevronRight, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as pdfjs from 'pdfjs-dist';
import { useLanguage } from '@/contexts/LanguageContext';

interface PDFOutlineProps {
  pdfUrl: string;
  onItemClick: (pageNumber: number) => void;
  className?: string;
}

interface OutlineItem {
  title: string;
  pageNumber: number;
  items?: OutlineItem[];
  expanded?: boolean;
}

const PDFOutline: React.FC<PDFOutlineProps> = ({ pdfUrl, onItemClick, className }) => {
  const { language } = useLanguage();
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOutline = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        // Try to get the outline (table of contents)
        const outline = await pdf.getOutline();
        
        if (!outline || outline.length === 0) {
          // If no outline exists, create one based on the document structure
          const items: OutlineItem[] = [];
          
          // Add an entry for each page
          for (let i = 1; i <= pdf.numPages; i++) {
            items.push({
              title: `${language === 'ar' ? 'صفحة' : 'Page'} ${i}`,
              pageNumber: i,
              expanded: false
            });
          }
          
          setOutline(items);
        } else {
          // Process the outline from the PDF
          const processOutlineItems = (items: any[]): OutlineItem[] => {
            return items.map(item => {
              // Get the page number from the destination
              let pageNumber = 1;
              if (item.dest) {
                if (typeof item.dest === 'string') {
                  // Handle named destinations - would need to resolve them
                  // This is simplified for this example
                  pageNumber = 1;
                } else if (Array.isArray(item.dest)) {
                  // The first element is the page reference
                  const ref = item.dest[0];
                  if (ref.num !== undefined) {
                    pageNumber = ref.num + 1; // PDF pages are 0-indexed
                  }
                }
              }
              
              return {
                title: item.title || 'Untitled Section',
                pageNumber,
                items: item.items ? processOutlineItems(item.items) : undefined,
                expanded: false
              };
            });
          };
          
          setOutline(processOutlineItems(outline));
        }
      } catch (err) {
        console.error('Error loading PDF outline:', err);
        setError(language === 'ar' 
          ? 'فشل في تحميل فهرس المستند' 
          : 'Failed to load document outline');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOutline();
  }, [pdfUrl, language]);

  const toggleExpand = (index: number, parentItems?: OutlineItem[]) => {
    const items = parentItems || outline;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      expanded: !newItems[index].expanded
    };
    
    if (!parentItems) {
      setOutline(newItems);
    } else {
      // This is a recursive update for nested items
      // In a real implementation, you'd need to update the parent items
      // This is simplified for this example
    }
  };

  const renderOutlineItems = (items: OutlineItem[], level = 0) => {
    return items.map((item, index) => (
      <div key={`${item.title}-${index}-${level}`} className="outline-item">
        <div 
          className={cn(
            "flex items-center py-1 px-2 rounded-md hover:bg-muted/50 cursor-pointer text-sm",
            { "pl-4": level === 0, "pl-8": level === 1, "pl-12": level === 2, "pl-16": level > 2 }
          )}
        >
          {item.items && item.items.length > 0 ? (
            <button
              onClick={() => toggleExpand(index)}
              className="mr-1 p-1 rounded-sm hover:bg-muted"
            >
              <ChevronRight 
                className={cn(
                  "h-3 w-3 transition-transform", 
                  item.expanded && "transform rotate-90"
                )} 
              />
            </button>
          ) : (
            <span className="w-5" />
          )}
          
          <span 
            className="truncate flex-1"
            onClick={() => onItemClick(item.pageNumber)}
            title={item.title}
          >
            {item.title}
          </span>
          
          <span className="text-xs text-muted-foreground ml-1">
            {item.pageNumber}
          </span>
        </div>
        
        {item.expanded && item.items && (
          <div className="ml-2 border-l border-border/50 pl-2">
            {renderOutlineItems(item.items, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className={cn("p-4 flex justify-center", className)}>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <FileText className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className={cn("p-2 overflow-y-auto", className)}>
      <div className="text-sm font-medium mb-2 px-2">
        {language === 'ar' ? 'فهرس المستند' : 'Document Outline'}
      </div>
      {outline.length === 0 ? (
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">
            {language === 'ar' 
              ? 'لا يوجد فهرس لهذا المستند' 
              : 'No outline available for this document'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {renderOutlineItems(outline)}
        </div>
      )}
    </div>
  );
};

export default PDFOutline;