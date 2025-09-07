import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  Search, 
  Download, 
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface ModernPDFViewerProps {
  pdfUrl: string;
  onDocumentLoadSuccess?: ({ numPages }: { numPages: number }) => void;
  onDocumentLoadError?: (error: Error) => void;
  onPageChange?: (pageNumber: number) => void;
  className?: string;
  isFullscreen?: boolean;
  onFullscreenToggle?: () => void;
}

const ModernPDFViewer: React.FC<ModernPDFViewerProps> = ({
  pdfUrl,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  onPageChange,
  className,
  isFullscreen = false,
  onFullscreenToggle
}) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInput, setPageInput] = useState('1');
  const [searchTerm, setSearchTerm] = useState('');
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
            setPageInput(pageNumber.toString());
            onPageChange?.(pageNumber);
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '-10% 0px -10% 0px',
        threshold: 0.5
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

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleRotateLeft = () => setRotation(prev => (prev - 90 + 360) % 360);
  const handleRotateRight = () => setRotation(prev => (prev + 90) % 360);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      const pageElement = pageRefs.current[page];
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handlePageInputChange = (value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value);
    if (pageNum && pageNum >= 1 && pageNum <= (numPages || 1)) {
      goToPage(pageNum);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < (numPages || 1)) {
      goToPage(currentPage + 1);
    }
  };

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-br from-background to-muted/30",
        "border border-border/50 rounded-lg overflow-hidden",
        className
      )}>
        {/* Enhanced Toolbar */}
        <div className="flex items-center justify-between p-3 bg-card/80 backdrop-blur-sm border-b border-border/50">
          {/* Left Section - Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1 text-sm">
              <Input
                type="number"
                value={pageInput}
                onChange={(e) => handlePageInputChange(e.target.value)}
                className="w-16 h-8 text-center text-xs"
                min="1"
                max={numPages || 1}
              />
              <span className="text-muted-foreground">من {numPages || '?'}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextPage}
              disabled={currentPage >= (numPages || 1)}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Center Section - Zoom Controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  className="h-8 w-8"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تصغير</TooltipContent>
            </Tooltip>
            
            <span className="text-sm min-w-[50px] text-center font-medium">
              {Math.round(scale * 100)}%
            </span>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  className="h-8 w-8"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تكبير</TooltipContent>
            </Tooltip>
            
            <div className="h-4 w-px bg-border mx-1" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotateLeft}
                  className="h-8 w-8"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تدوير يساراً</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotateRight}
                  className="h-8 w-8"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>تدوير يميناً</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {onFullscreenToggle && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFullscreenToggle}
                    className="h-8 w-8"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isFullscreen ? 'تصغير' : 'ملء الشاشة'}</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>

        {/* PDF Content */}
        <ScrollArea className="flex-1">
          <div
            ref={containerRef}
            className="p-4 space-y-4 flex flex-col items-center min-h-full"
          >
            <Document
              file={pdfUrl}
              onLoadSuccess={handleDocumentLoadSuccess}
              onLoadError={handleDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center min-h-[400px] py-10 w-full">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 h-12 w-12 rounded-full bg-gradient-to-r from-primary/10 to-primary/30 animate-pulse" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground font-medium">
                    جاري تحميل المستند...
                  </p>
                  <div className="mt-2 w-32 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-glow w-1/3 animate-pulse rounded-full" />
                  </div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
                  <div className="text-destructive mb-4">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-foreground font-medium mb-1">فشل في تحميل المستند</p>
                  <p className="text-muted-foreground text-sm">تحقق من اتصالك بالإنترنت وحاول مرة أخرى</p>
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
                      "relative mb-4 p-2 bg-white rounded-xl shadow-lg border transition-all duration-300",
                      "hover:shadow-xl hover:scale-[1.02]",
                      currentPage === pageNumber && "ring-2 ring-primary/50 shadow-primary/20"
                    )}
                    style={{ 
                      minHeight: 300,
                      scrollMarginTop: '80px'
                    }}
                  >
                    {/* Page Number Badge */}
                    <div className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium z-10">
                      {pageNumber}
                    </div>
                    
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="max-w-full transition-all duration-300 ease-in-out"
                      loading={
                        <div className="flex items-center justify-center h-96 w-full">
                          <div className="relative">
                            <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                            <div className="absolute inset-0 h-8 w-8 rounded-full bg-primary/10 animate-pulse" />
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center h-64 w-full bg-muted/20 rounded-lg">
                          <div className="text-muted-foreground mb-2">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-sm text-muted-foreground">
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
    </TooltipProvider>
  );
};

export default ModernPDFViewer;