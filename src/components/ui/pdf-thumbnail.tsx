import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFThumbnailProps {
  pdfUrl: string;
  className?: string;
  width?: number;
  height?: number;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({ 
  pdfUrl, 
  className,
  width = 200,
  height = 280
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset states when PDF URL changes
    setIsLoading(true);
    setError(null);
  }, [pdfUrl]);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = () => {
    setIsLoading(false);
    setError('Failed to load PDF thumbnail');
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-muted/20 flex items-center justify-center",
        className
      )}
      style={{ width, height }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center h-full w-full p-4">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-2" />
          <p className="text-xs text-muted-foreground text-center">PDF preview unavailable</p>
        </div>
      ) : (
        <Document
          file={pdfUrl}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          loading={null}
          error={null}
          className="w-full h-full"
        >
          <Page 
            pageNumber={1} 
            width={width}
            height={height}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="w-full h-full"
          />
        </Document>
      )}
    </div>
  );
};

export default PDFThumbnail;