
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewProps {
  pdfUrl: string;
  maxHeight?: number;
}

const PDFPreview = ({ pdfUrl, maxHeight = 500 }: PDFPreviewProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when PDF URL changes
    setNumPages(null);
    setPageNumber(1);
    setLoading(true);
    setError(null);
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const goToPreviousPage = () => {
    setPageNumber(prevPageNumber => Math.max(prevPageNumber - 1, 1));
  };

  const goToNextPage = () => {
    if (numPages) {
      setPageNumber(prevPageNumber => Math.min(prevPageNumber + 1, numPages));
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div 
        style={{ maxHeight: `${maxHeight}px`, overflow: 'auto' }} 
        className="border rounded-xl w-full bg-gradient-to-b from-card to-card/80 backdrop-blur-sm shadow-lg relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-10 rounded-xl">
            <div className="p-4 glass-card rounded-xl flex items-center space-x-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Loading PDF...</span>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="p-8 text-center text-red-500 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="p-8 text-center animate-pulse">
                <div className="h-4 bg-muted rounded-full w-3/4 mx-auto mb-3"></div>
                <div className="h-4 bg-muted rounded-full w-1/2 mx-auto"></div>
              </div>
            }
            className="mx-auto"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={1.0}
              className="mx-auto drop-shadow-md"
            />
          </Document>
        )}
      </div>
      
      {numPages && numPages > 1 && (
        <div className="flex items-center justify-center mt-6 space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage} 
            disabled={pageNumber <= 1}
            className={cn(
              "rounded-full transition-all duration-300",
              pageNumber <= 1 ? "opacity-50" : "hover:bg-primary hover:text-primary-foreground"
            )}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm bg-muted px-3 py-1 rounded-full text-muted-foreground">
            {pageNumber} / {numPages}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1)}
            className={cn(
              "rounded-full transition-all duration-300",
              pageNumber >= (numPages || 1) ? "opacity-50" : "hover:bg-primary hover:text-primary-foreground"
            )}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .react-pdf__Page {
          margin: 0 auto;
          padding: 1.5rem;
          box-sizing: border-box;
        }
        
        .react-pdf__Page__canvas {
          border-radius: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          background: white;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        @media (prefers-color-scheme: dark) {
          .glass-card {
            background: rgba(30, 30, 30, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      ` }} />
    </div>
  );
};

export default PDFPreview;
