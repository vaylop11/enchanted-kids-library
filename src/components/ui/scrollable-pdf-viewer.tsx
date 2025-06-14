
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
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement }>({});

  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    onDocumentLoadSuccess?.({ numPages });
  };

  const handleDocumentLoadError = (error: Error) => {
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

  const scrollToPage = useCallback((pageNumber: number) => {
    const pageElement = pageRefs.current[pageNumber];
    if (pageElement && containerRef.current) {
      pageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Controls */}
      <div className="flex items-center justify-between p-4 bg-muted/20 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Page {currentPage} of {numPages || '?'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm min-w-[50px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="mx-2 h-4 border-r border-border" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateLeft}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotateRight}
            className="h-8 w-8 p-0"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Page Navigator */}
      {numPages && numPages > 1 && (
        <div className="flex items-center gap-1 p-2 bg-muted/10 border-b overflow-x-auto">
          {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              onClick={() => scrollToPage(pageNum)}
              className="h-8 min-w-8 text-xs"
            >
              {pageNum}
            </Button>
          ))}
        </div>
      )}

      {/* Scrollable PDF Content */}
      <ScrollArea className="flex-1">
        <div
          ref={containerRef}
          className="p-4 space-y-4 bg-muted/10"
        >
          <Document
            file={pdfUrl}
            onLoadSuccess={handleDocumentLoadSuccess}
            onLoadError={handleDocumentLoadError}
            loading={
              <div className="flex items-center justify-center h-96">
                <div className="h-12 w-12 rounded-full border-4 border-muted-foreground/20 border-t-primary animate-spin" />
              </div>
            }
            error={
              <div className="flex flex-col items-center justify-center h-96">
                <p className="text-muted-foreground">Failed to load PDF</p>
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
                  className="flex justify-center mb-4 p-2 bg-white rounded-lg shadow-sm border"
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    rotate={rotation}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="max-w-full"
                    loading={
                      <div className="flex items-center justify-center h-96 w-full">
                        <div className="h-8 w-8 rounded-full border-2 border-muted-foreground/20 border-t-primary animate-spin" />
                      </div>
                    }
                    error={
                      <div className="flex items-center justify-center h-96 w-full bg-muted/20 rounded">
                        <p className="text-sm text-muted-foreground">
                          Error loading page {pageNumber}
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
