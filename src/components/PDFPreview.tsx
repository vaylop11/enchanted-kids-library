
import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { language, direction } = useLanguage();

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
    setError(language === 'ar' ? 'فشل في تحميل ملف PDF' : 'Failed to load PDF document');
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
    <div className="flex flex-col items-center" dir={direction}>
      <div 
        style={{ maxHeight: `${maxHeight}px`, overflow: 'auto' }} 
        className="border rounded-lg w-full bg-white dark:bg-gray-800 shadow-sm relative"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        
        {error ? (
          <div className="p-6 text-center text-red-500">
            <p>{error}</p>
          </div>
        ) : (
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<div className="p-8 text-center">{language === 'ar' ? 'جاري تحميل الملف...' : 'Loading PDF...'}</div>}
            className="mx-auto"
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              scale={1.0}
              className="mx-auto"
            />
          </Document>
        )}
      </div>
      
      {numPages && numPages > 1 && (
        <div className={cn(
          "flex items-center justify-center mt-4 space-x-2",
          direction === 'rtl' ? 'space-x-reverse' : ''
        )}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage} 
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className={cn("h-4 w-4", direction === 'rtl' ? 'ml-1 rotate-180' : 'mr-1')} />
            {language === 'ar' ? 'السابق' : 'Previous'}
          </Button>
          
          <span className="text-sm">
            {language === 'ar' 
              ? `${pageNumber} من ${numPages}` 
              : `Page ${pageNumber} of ${numPages}`
            }
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1)}
          >
            {language === 'ar' ? 'التالي' : 'Next'}
            <ChevronRight className={cn("h-4 w-4", direction === 'rtl' ? 'mr-1 rotate-180' : 'ml-1')} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFPreview;
