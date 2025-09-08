import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Move,
  Hand,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from '@/components/ui/slider';

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
  const isMobile = useIsMobile();
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(isMobile ? 0.7 : 1.0);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [loadedPages, setLoadedPages] = useState<Set<number>>(new Set());
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<{ [key: number]: HTMLDivElement }>({});
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized scale options for better performance
  const scaleOptions = useMemo(() => [
    { label: '25%', value: 0.25 },
    { label: '50%', value: 0.5 },
    { label: '75%', value: 0.75 },
    { label: '100%', value: 1.0 },
    { label: '125%', value: 1.25 },
    { label: '150%', value: 1.5 },
    { label: '200%', value: 2.0 },
  ], []);

  // Optimized document load handler
  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setLoadingProgress(100);
    onDocumentLoadSuccess?.({ numPages });
  }, [onDocumentLoadSuccess]);

  const handleDocumentLoadError = useCallback((error: Error) => {
    setIsLoading(false);
    setError(error.message);
    onDocumentLoadError?.(error);
  }, [onDocumentLoadError]);

  // Optimized page load handler
  const handlePageLoadSuccess = useCallback((pageNumber: number) => {
    setLoadedPages(prev => new Set([...prev, pageNumber]));
  }, []);

  // Enhanced intersection observer for better performance
  useEffect(() => {
    if (!numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visiblePageNumbers = new Set<number>();
        
        entries.forEach((entry) => {
          const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '1');
          
          if (entry.isIntersecting) {
            visiblePageNumbers.add(pageNumber);
          }
        });

        setVisiblePages(visiblePageNumbers);

        // Update current page to the first visible page
        if (visiblePageNumbers.size > 0) {
          const firstVisible = Math.min(...Array.from(visiblePageNumbers));
          setCurrentPage(firstVisible);
          setPageInput(firstVisible.toString());
          onPageChange?.(firstVisible);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '-20% 0px -20% 0px',
        threshold: [0.1, 0.5, 0.9]
      }
    );

    observerRef.current = observer;

    // Observe all page elements
    Object.values(pageRefs.current).forEach((pageElement) => {
      if (pageElement) {
        observer.observe(pageElement);
      }
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [numPages, onPageChange]);

  // Optimized zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + (isMobile ? 0.1 : 0.25), 3.0));
  }, [isMobile]);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - (isMobile ? 0.1 : 0.25), 0.25));
  }, [isMobile]);

  const handleScaleChange = useCallback((value: number[]) => {
    setScale(value[0]);
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation(prev => (prev - 90 + 360) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Enhanced page navigation
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      const pageElement = pageRefs.current[page];
      if (pageElement) {
        pageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [numPages]);

  const handlePageInputChange = useCallback((value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value);
    if (pageNum && pageNum >= 1 && pageNum <= (numPages || 1)) {
      goToPage(pageNum);
    }
  }, [goToPage, numPages]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [currentPage, goToPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < (numPages || 1)) {
      goToPage(currentPage + 1);
    }
  }, [currentPage, numPages, goToPage]);

  // Enhanced loading component
  const LoadingComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 w-full space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
        <FileText className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-semibold text-foreground">
          جاري تحميل المستند
        </p>
        <p className="text-sm text-muted-foreground">
          يرجى الانتظار قليلاً...
        </p>
      </div>
      <div className="w-64 bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ease-out"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>
    </div>
  );

  // Enhanced error component
  const ErrorComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
      <div className="relative">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-foreground">فشل في تحميل المستند</h3>
        <p className="text-sm text-muted-foreground">
          {error || 'حدث خطأ أثناء تحميل ملف PDF. يرجى التحقق من الرابط والمحاولة مرة أخرى.'}
        </p>
      </div>
      <Button 
        onClick={() => window.location.reload()} 
        variant="outline"
        className="mt-4"
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        إعادة المحاولة
      </Button>
    </div>
  );

  // Should render page check for performance
  const shouldRenderPage = useCallback((pageNumber: number) => {
    const visiblePageNumbers = Array.from(visiblePages);
    if (visiblePageNumbers.length === 0) return pageNumber <= 3; // Render first 3 pages initially
    
    const minVisible = Math.min(...visiblePageNumbers);
    const maxVisible = Math.max(...visiblePageNumbers);
    
    // Render visible pages + 2 pages before and after for smooth scrolling
    return pageNumber >= (minVisible - 2) && pageNumber <= (maxVisible + 2);
  }, [visiblePages]);

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-br from-background/95 via-background to-muted/20",
        "border border-border/50 rounded-xl overflow-hidden shadow-lg",
        className
      )}>
        {/* Enhanced Toolbar */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border/50",
          "shadow-sm transition-all duration-300",
          isMobile ? "p-2 gap-2" : "p-3 gap-4"
        )}>
          {isMobile ? (
            /* Mobile Toolbar */
            <>
              {/* Page Navigation */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 rounded-lg hover:bg-primary/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={pageInput}
                    onChange={(e) => handlePageInputChange(e.target.value)}
                    className="w-12 h-7 text-center text-xs border-border/30 rounded-lg"
                    min="1"
                    max={numPages || 1}
                  />
                  <span className="text-xs text-muted-foreground font-medium">
                    /{numPages || '?'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage >= (numPages || 1)}
                  className="h-8 w-8 rounded-lg hover:bg-primary/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.25}
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                
                <Badge variant="secondary" className="text-xs px-2 py-1 min-w-[45px]">
                  {Math.round(scale * 100)}%
                </Badge>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale >= 3.0}
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              {/* Rotation */}
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotateLeft}
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotateRight}
                  className="h-7 w-7 rounded-lg hover:bg-primary/10"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
              </div>
            </>
          ) : (
            /* Desktop Toolbar */
            <>
              {/* Left: Page Navigation */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="h-9 w-9 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5">
                  <Input
                    type="number"
                    value={pageInput}
                    onChange={(e) => handlePageInputChange(e.target.value)}
                    className="w-16 h-7 text-center text-sm border-0 bg-background/50"
                    min="1"
                    max={numPages || 1}
                  />
                  <span className="text-sm text-muted-foreground font-medium">
                    من {numPages || '?'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage >= (numPages || 1)}
                  className="h-9 w-9 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Center: Zoom Controls */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.25}
                  className="h-9 w-9 rounded-lg hover:bg-primary/10"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3 bg-muted/30 rounded-lg px-4 py-2">
                  <Slider
                    value={[scale]}
                    onValueChange={handleScaleChange}
                    max={3.0}
                    min={0.25}
                    step={0.25}
                    className="w-32"
                  />
                  <Badge variant="secondary" className="text-sm px-3 py-1 min-w-[60px]">
                    {Math.round(scale * 100)}%
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale >= 3.0}
                  className="h-9 w-9 rounded-lg hover:bg-primary/10"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRotateLeft}
                        className="h-8 w-8 rounded-md hover:bg-primary/10"
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
                        className="h-8 w-8 rounded-md hover:bg-primary/10"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>تدوير يميناً</TooltipContent>
                  </Tooltip>
                </div>

                {onFullscreenToggle && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={onFullscreenToggle}
                        className="h-9 w-9 rounded-lg hover:bg-primary/10"
                      >
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isFullscreen ? 'تصغير الشاشة' : 'ملء الشاشة'}
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </>
          )}
        </div>

        {/* PDF Content Area */}
        <div className="flex-1 relative overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div
              ref={containerRef}
              className={cn(
                "flex flex-col items-center min-h-full",
                isMobile ? "p-2 space-y-2" : "p-4 space-y-4"
              )}
            >
              <Document
                file={pdfUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                onLoadProgress={({ loaded, total }) => {
                  setLoadingProgress(Math.round((loaded / total) * 100));
                }}
                loading={<LoadingComponent />}
                error={<ErrorComponent />}
                options={{
                  cMapUrl: `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                }}
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
                        "relative bg-white rounded-xl border transition-all duration-300",
                        "hover:shadow-lg hover:border-primary/20",
                        isMobile ? "shadow-md" : "shadow-lg hover:shadow-xl",
                        visiblePages.has(pageNumber) && "ring-2 ring-primary/30 shadow-primary/10",
                        isMobile ? "p-2" : "p-3"
                      )}
                      style={{ 
                        scrollMarginTop: isMobile ? '70px' : '90px'
                      }}
                    >
                      {/* Page Number Badge */}
                      <Badge 
                        variant={visiblePages.has(pageNumber) ? "default" : "secondary"}
                        className={cn(
                          "absolute z-10 font-semibold shadow-lg",
                          isMobile 
                            ? "-top-2 right-3 text-xs px-2 py-1" 
                            : "-top-3 right-4 text-sm px-3 py-1"
                        )}
                      >
                        {pageNumber}
                      </Badge>
                      
                      {shouldRenderPage(pageNumber) ? (
                        <Page
                          key={`${pageNumber}-${scale}-${rotation}`}
                          pageNumber={pageNumber}
                          scale={scale}
                          rotate={rotation}
                          renderTextLayer={false}
                          renderAnnotationLayer={true}
                          onLoadSuccess={() => handlePageLoadSuccess(pageNumber)}
                          className="max-w-full transition-all duration-300 ease-out"
                          loading={
                            <div className="flex items-center justify-center bg-muted/20 rounded-lg" 
                                 style={{ height: isMobile ? '300px' : '400px' }}>
                              <div className="flex flex-col items-center space-y-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground">
                                  جاري تحميل الصفحة {pageNumber}
                                </p>
                              </div>
                            </div>
                          }
                          error={
                            <div className="flex flex-col items-center justify-center bg-destructive/5 rounded-lg border-2 border-dashed border-destructive/20"
                                 style={{ height: isMobile ? '250px' : '350px' }}>
                              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                              <p className="text-sm text-destructive font-medium">
                                خطأ في تحميل الصفحة {pageNumber}
                              </p>
                            </div>
                          }
                        />
                      ) : (
                        <div className="flex items-center justify-center bg-muted/10 rounded-lg"
                             style={{ height: isMobile ? '250px' : '350px' }}>
                          <p className="text-muted-foreground text-sm">
                            الصفحة {pageNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
              </Document>
            </div>
          </ScrollArea>
        </div>

        {/* Status Bar */}
        {numPages && (
          <div className={cn(
            "flex-shrink-0 bg-muted/20 border-t border-border/30 text-center",
            isMobile ? "py-1.5 px-3" : "py-2 px-4"
          )}>
            <p className="text-xs text-muted-foreground">
              {loadedPages.size} من {numPages} صفحة محملة • 
              الصفحة الحالية: {currentPage} • 
              التكبير: {Math.round(scale * 100)}%
            </p>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default ModernPDFViewer;
