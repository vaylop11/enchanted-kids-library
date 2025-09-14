import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
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

// Fix PDF.js worker setup - This is crucial
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Alternative worker URLs if the above doesn't work
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
// pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();

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
  const [scale, setScale] = useState(isMobile ? 0.8 : 1.0);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [pageInput, setPageInput] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Document load handlers
  const handleDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully with', numPages, 'pages');
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    setRetryCount(0);
    onDocumentLoadSuccess?.({ numPages });
  }, [onDocumentLoadSuccess]);

  const handleDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF loading failed:', error);
    setIsLoading(false);
    setError(`Failed to load PDF: ${error.message}`);
    onDocumentLoadError?.(error);
  }, [onDocumentLoadError]);

  // Retry loading
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setRetryCount(prev => prev + 1);
  }, []);

  // Enhanced zoom handlers
  const handleZoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const handleScaleChange = useCallback((value: number[]) => {
    setScale(value[0]);
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation(prev => (prev - 90 + 360) % 360);
  }, []);

  const handleRotateRight = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Page navigation
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= (numPages || 1)) {
      setCurrentPage(page);
      setPageInput(page.toString());
      onPageChange?.(page);
    }
  }, [numPages, onPageChange]);

  const handlePageInputChange = useCallback((value: string) => {
    setPageInput(value);
    const pageNum = parseInt(value);
    if (pageNum && pageNum >= 1 && pageNum <= (numPages || 1)) {
      setCurrentPage(pageNum);
      onPageChange?.(pageNum);
    }
  }, [numPages, onPageChange]);

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

  // Enhanced Loading Component
  const LoadingComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-12 w-full space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full border-4 border-primary/20 animate-spin border-t-primary" />
        <FileText className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-foreground">جاري تحميل المستند</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          يرجى الانتظار بينما نقوم بتحميل ملف PDF...
        </p>
        {retryCount > 0 && (
          <p className="text-xs text-muted-foreground">
            المحاولة رقم {retryCount + 1}
          </p>
        )}
      </div>
    </div>
  );

  // Enhanced Error Component
  const ErrorComponent = () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-6">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
      </div>
      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-foreground">فشل في تحميل المستند</h3>
        <p className="text-sm text-muted-foreground">
          {error || 'حدث خطأ أثناء تحميل ملف PDF. يرجى التحقق من الرابط والمحاولة مرة أخرى.'}
        </p>
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <p><strong>نصائح لحل المشكلة:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>تأكد من صحة رابط PDF</li>
            <li>تحقق من اتصالك بالإنترنت</li>
            <li>قم بإيقاف IDM أو أي download manager</li>
            <li>تأكد من عدم حجب الملف بواسطة CORS</li>
          </ul>
        </div>
      </div>
      <Button 
        onClick={handleRetry} 
        variant="outline"
        className="mt-4"
        disabled={isLoading}
      >
        <RefreshCcw className="h-4 w-4 mr-2" />
        إعادة المحاولة
      </Button>
    </div>
  );

  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col h-full bg-gradient-to-br from-background/95 via-background to-muted/20",
        "border border-border/50 rounded-xl overflow-hidden shadow-lg",
        className
      )}>
        {/* Toolbar */}
        <div className={cn(
          "flex-shrink-0 flex items-center justify-between bg-card/90 backdrop-blur-md border-b border-border/50",
          "shadow-sm transition-all duration-300",
          isMobile ? "p-2 gap-2" : "p-3 gap-4"
        )}>
          {isMobile ? (
            // Mobile Toolbar
            <>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || !numPages}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={pageInput}
                    onChange={(e) => handlePageInputChange(e.target.value)}
                    className="w-12 h-7 text-center text-xs"
                    min="1"
                    max={numPages || 1}
                    disabled={!numPages}
                  />
                  <span className="text-xs text-muted-foreground">
                    /{numPages || '?'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage >= (numPages || 1) || !numPages}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.25}
                  className="h-7 w-7"
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                
                <Badge variant="secondary" className="text-xs px-2 min-w-[45px]">
                  {Math.round(scale * 100)}%
                </Badge>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomIn}
                  disabled={scale >= 3.0}
                  className="h-7 w-7"
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotateLeft}
                  className="h-7 w-7"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRotateRight}
                  className="h-7 w-7"
                >
                  <RotateCw className="h-3 w-3" />
                </Button>
              </div>
            </>
          ) : (
            // Desktop Toolbar
            <>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1 || !numPages}
                  className="h-9 w-9"
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
                    disabled={!numPages}
                  />
                  <span className="text-sm text-muted-foreground">
                    من {numPages || '?'}
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage >= (numPages || 1) || !numPages}
                  className="h-9 w-9"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.25}
                  className="h-9 w-9"
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
                  className="h-9 w-9"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotateLeft}
                    className="h-8 w-8"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRotateRight}
                    className="h-8 w-8"
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>

                {onFullscreenToggle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onFullscreenToggle}
                    className="h-9 w-9"
                  >
                    {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>

        {/* PDF Content */}
        <div className="flex-1 relative overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div
              ref={containerRef}
              className={cn(
                "flex flex-col items-center justify-center min-h-full",
                isMobile ? "p-3" : "p-6"
              )}
            >
              <Document
                key={`${pdfUrl}-${retryCount}`} // Force re-render on retry
                file={pdfUrl}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                loading={<LoadingComponent />}
                error={<ErrorComponent />}
                options={{
                  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
                  cMapPacked: true,
                  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
                  // Add timeout
                  httpHeaders: {},
                  withCredentials: false,
                }}
              >
                {numPages && (
                  <div className="bg-white rounded-xl shadow-lg border p-4 max-w-full">
                    <Page
                      key={`page_${currentPage}_${scale}_${rotation}`}
                      pageNumber={currentPage}
                      scale={scale}
                      rotate={rotation}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      className="max-w-full"
                      loading={
                        <div className="flex items-center justify-center bg-muted/20 rounded-lg min-h-[400px]">
                          <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">
                              جاري تحميل الصفحة {currentPage}
                            </p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="flex flex-col items-center justify-center bg-destructive/5 rounded-lg border-2 border-dashed border-destructive/20 min-h-[400px]">
                          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                          <p className="text-sm text-destructive">
                            خطأ في تحميل الصفحة {currentPage}
                          </p>
                        </div>
                      }
                    />
                    
                    {/* Page Info */}
                    <div className="mt-4 text-center">
                      <Badge variant="outline">
                        الصفحة {currentPage} من {numPages}
                      </Badge>
                    </div>
                  </div>
                )}
              </Document>
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
<div className="h-16 sm:h-18 mb-4 sm:mb-6" />
  );
};

export default ModernPDFViewer;
