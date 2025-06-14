
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw } from 'lucide-react';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ScrollablePDFViewerProps {
  pdfUrl: string;
  onDocumentLoadSuccess?: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError?: (error: Error) => void;
  onPageChange?: (pageNumber: number) => void;
  className?: string;
}

const ScrollablePDFViewer: React.FC<ScrollablePDFViewerProps> = ({
  pdfUrl,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  onPageChange,
  className
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    onDocumentLoadSuccess?.({ numPages });
  };

  const handleDocumentLoadError = (error: Error) => {
    setIsLoading(false);
    onDocumentLoadError?.(error);
  };

  // Intersection Observer to track which page is currently visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '1');
            setCurrentPage(pageNumber);
            onPageChange?.(pageNumber);
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '-40% 0px -40% 0px',
        threshold: 0.1
      }
    );

    Object.values(pageRefs.current).forEach((pageElement) => {
      if (pageElement) {
        observer.observe(pageElement);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [numPages, onPageChange]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Responsive style helpers
  const viewerContainerClasses = cn(
    "flex flex-col h-full",
    "md:h-[calc(100vh-160px)]",
    "bg-muted/10",
    "transition-all duration-200 ease-in-out",
    className
  );

  const pdfPagesWrapperClasses = cn(
    "p-2 space-y-4 flex flex-col items-center",
    "sm:p-4",
    "w-full",
    "md:max-w-3xl",
    "mx-auto"
  );

  return (
    <div className={viewerContainerClasses}>
      {/* Controls */}
      <div className="flex items-center justify-between p-2 sm:p-4 bg-muted/20 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-medium">
            صفحة {currentPage} من {numPages || '?'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
            aria-label="تصغير"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-xs sm:text-sm min-w-[38px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
            aria-label="تكبير"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="mx-1 h-4 border-r border-border" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateLeft}
            className="h-8 w-8 p-0"
            aria-label="تدوير لليسار"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateRight}
            className="h-8 w-8 p-0"
            aria-label="تدوير لليمين"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scrollable PDF Content with smooth scrolling */}
      <ScrollArea className="flex-1 w-full">
        <div
          ref={containerRef}
          className={pdfPagesWrapperClasses}
          style={{ scrollBehavior: 'smooth' }}
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            loading={
              <div className="flex flex-col items-center justify-center min-h-72 py-10 w-full">
                <div className="h-14 w-14 rounded-full border-4 border-primary border-t-muted-foreground/30 animate-spin mb-2" />
                <span className="mt-2 text-sm text-muted-foreground font-medium animate-pulse">
                  جاري تحميل الملف...
                </span>
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center min-h-40">
                <p className="text-muted-foreground">فشل في تحميل الملف</p>
              </div>
            }
          >
            {numPages &&
              Array.from({ length: numPages }, (_, i) => i + 1).map((pageNumber) => (
                <div
                  key={pageNumber}
                  ref={(el) => {
                    if (el) pageRefs.current[pageNumber] = el;
                  }}
                  data-page-number={pageNumber}
                  className={cn(
                    "flex justify-center items-center mb-3 sm:mb-4 p-1 sm:p-2 bg-white rounded-lg shadow-sm border",
                    "transition-all duration-300 ease-in-out",
                    "w-full"
                  )}
                  style={{ 
                    minHeight: 220,
                    scrollMarginTop: '20px'
                  }}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full transition-transform duration-300 ease-in-out"
                    loading={
                      <div className="flex items-center justify-center h-96 w-full">
                        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-muted-foreground/40 animate-spin" />
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-56 w-full bg-muted/20 rounded">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          خطأ في تحميل الصفحة {pageNumber}
                        </p>
                      </div>
                    }
                  />
                </div>
              ))}
          </Document>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ScrollablePDFViewer;
