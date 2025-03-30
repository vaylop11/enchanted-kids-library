
import { useEffect, useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Languages, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { SupportedLanguage, supportedLanguages } from '@/components/LanguageSelector';
import { toast } from 'sonner';
import { translatePDFPage } from '@/services/pdfAnalysisService';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFPreviewProps {
  pdfUrl: string;
  maxHeight?: number;
  onPageChange?: (pageNumber: number) => void;
}

const PDFPreview = ({ pdfUrl, maxHeight = 500, onPageChange }: PDFPreviewProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language, direction } = useLanguage();
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Zoom states
  const [scale, setScale] = useState(1.0);
  const minScale = 0.5;
  const maxScale = 2.5;
  const scaleStep = 0.1;
  
  // Translation states
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedPages, setTranslatedPages] = useState<Record<number, { text: string, isRTL: boolean }>>({});
  const [viewMode, setViewMode] = useState<'original' | 'translated'>('original');
  const [activeTranslation, setActiveTranslation] = useState<SupportedLanguage | null>(null);

  useEffect(() => {
    // Reset state when PDF URL changes
    setNumPages(null);
    setPageNumber(1);
    setLoading(true);
    setError(null);
    setTranslatedPages({});
    setViewMode('original');
    setActiveTranslation(null);
    setScale(1.0);
  }, [pdfUrl]);

  // Call onPageChange prop when pageNumber changes
  useEffect(() => {
    onPageChange?.(pageNumber);
  }, [pageNumber, onPageChange]);

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

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value) return;
    
    const pageNum = parseInt(value, 10);
    if (isNaN(pageNum)) return;
    
    if (numPages && pageNum >= 1 && pageNum <= numPages) {
      setPageNumber(pageNum);
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const input = e.currentTarget;
      const pageNum = parseInt(input.value.trim(), 10);
      
      if (!isNaN(pageNum) && numPages && pageNum >= 1 && pageNum <= numPages) {
        setPageNumber(pageNum);
      } else if (numPages) {
        // Reset to valid value if input is invalid
        input.value = pageNumber.toString();
      }
    }
  };

  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + scaleStep, maxScale));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - scaleStep, minScale));
  };

  const handleTranslatePage = async (targetLang: SupportedLanguage) => {
    if (!pdfUrl || !numPages) return;
    
    setIsTranslating(true);
    setActiveTranslation(targetLang);
    
    try {
      // تأكد من أننا نترجم فقط الصفحة الحالية المعروضة
      const currentPageToTranslate = pageNumber;
      
      // تحقق مما إذا كانت هذه الصفحة مترجمة بالفعل إلى هذه اللغة
      const cacheKey = `${currentPageToTranslate}-${targetLang.code}`;
      const existingTranslation = sessionStorage.getItem(cacheKey);
      
      if (existingTranslation) {
        try {
          const parsed = JSON.parse(existingTranslation);
          
          setTranslatedPages(prev => ({
            ...prev,
            [currentPageToTranslate]: {
              text: parsed.text,
              isRTL: parsed.isRTL
            }
          }));
          
          setViewMode('translated');
          toast.success(language === 'ar' 
            ? `تم تحميل الترجمة المحفوظة للصفحة ${currentPageToTranslate} إلى ${targetLang.localName}` 
            : `Loaded cached translation of page ${currentPageToTranslate} to ${targetLang.name}`);
          
          setIsTranslating(false);
          return;
        } catch (e) {
          console.error('Error parsing cached translation:', e);
          // Continue with fresh translation if cache parsing fails
        }
      }
      
      // Show loading toast
      const loadingId = toast.loading(language === 'ar' 
        ? `جاري ترجمة الصفحة ${currentPageToTranslate} إلى ${targetLang.localName}...` 
        : `Translating page ${currentPageToTranslate} to ${targetLang.name}...`);
      
      // استدعاء وظيفة ترجمة الصفحة الحالية فقط
      const { translatedText, isRTL } = await translatePDFPage(
        pdfUrl,
        currentPageToTranslate,
        targetLang.name,
        targetLang.code,
        (progress) => {
          // Optional: handle progress updates
        }
      );
      
      // Save the translation
      setTranslatedPages(prev => ({
        ...prev,
        [currentPageToTranslate]: {
          text: translatedText,
          isRTL: isRTL
        }
      }));
      
      // Cache the translation in sessionStorage
      try {
        sessionStorage.setItem(cacheKey, JSON.stringify({
          text: translatedText,
          isRTL: isRTL
        }));
      } catch (e) {
        console.warn('Could not cache translation:', e);
      }
      
      toast.dismiss(loadingId);
      toast.success(language === 'ar' 
        ? `تمت ترجمة الصفحة ${currentPageToTranslate} إلى ${targetLang.localName}` 
        : `Page ${currentPageToTranslate} translated to ${targetLang.name}`);
      
      setViewMode('translated');
    } catch (error) {
      console.error('Error translating page:', error);
      toast.error(language === 'ar' 
        ? `فشل في ترجمة الصفحة ${pageNumber}` 
        : `Failed to translate page ${pageNumber}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const resetView = () => {
    setViewMode('original');
  };

  // Filter languages to exclude current app language
  const filteredLanguages = supportedLanguages.filter(lang => 
    lang.code !== (language === 'ar' ? 'ar' : 'en')
  );

  // Custom page renderer for translated content
  const CustomPageRenderer = ({
    canvasRef,
    pageNumber
  }: {
    canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
    pageNumber: number;
  }) => {
    const translatedContent = translatedPages[pageNumber];
    const contentDirection = translatedContent?.isRTL ? 'rtl' : 'ltr';
    
    if (!translatedContent) {
      return null;
    }
    
    return (
      <div 
        className="pdf-page-translation bg-white p-6 shadow-md rounded-lg max-w-full mx-auto overflow-auto"
        style={{ minHeight: '400px', maxHeight: `${maxHeight}px` }} 
        dir={contentDirection}
      >
        <div className="whitespace-pre-wrap text-right font-arabic" style={{ textAlign: contentDirection === 'rtl' ? 'right' : 'left' }}>
          {translatedContent.text}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center" dir={direction}>
      <div className="w-full flex flex-col md:flex-row justify-between items-center gap-2 mb-4">
        {/* Page navigation controls */}
        <div className={cn(
          "flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-start",
        )}>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPreviousPage} 
            disabled={pageNumber <= 1 || loading || !!error}
            aria-label={language === 'ar' ? 'الصفحة السابقة' : 'Previous page'}
            className="flex items-center gap-1"
          >
            <ChevronLeft className={cn("h-4 w-4", direction === 'rtl' && 'rotate-180')} />
            {!isMobile && (language === 'ar' ? 'السابق' : 'Prev')}
          </Button>
          
          <div className="flex items-center gap-1">
            <Input
              ref={inputRef}
              type="text"
              defaultValue={pageNumber}
              onChange={handlePageInputChange}
              onKeyDown={handlePageInputKeyDown}
              onBlur={() => {
                if (inputRef.current) inputRef.current.value = pageNumber.toString();
              }}
              className="w-14 text-center h-9"
              aria-label={language === 'ar' ? 'رقم الصفحة' : 'Page number'}
            />
            <span className="text-sm whitespace-nowrap">
              {language === 'ar' 
                ? `من ${numPages || '؟'}` 
                : `of ${numPages || '?'}`
              }
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage} 
            disabled={pageNumber >= (numPages || 1) || loading || !!error}
            aria-label={language === 'ar' ? 'الصفحة التالية' : 'Next page'}
            className="flex items-center gap-1"
          >
            {!isMobile && (language === 'ar' ? 'التالي' : 'Next')}
            <ChevronRight className={cn("h-4 w-4", direction === 'rtl' && 'rotate-180')} />
          </Button>
        </div>
        
        {/* Zoom controls and translation options */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              disabled={scale <= minScale || loading || !!error}
              aria-label={language === 'ar' ? 'تصغير' : 'Zoom out'}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            
            <span className="text-xs bg-muted/30 px-2 py-1 rounded min-w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              disabled={scale >= maxScale || loading || !!error}
              aria-label={language === 'ar' ? 'تكبير' : 'Zoom in'}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {viewMode === 'translated' && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetView}
              className="flex items-center gap-1"
              aria-label={language === 'ar' ? 'العودة للعرض الأصلي' : 'Return to original view'}
            >
              <RotateCw className="h-3 w-3" />
              {!isMobile && (language === 'ar' ? 'العرض الأصلي' : 'Original')}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isTranslating || loading || !!error || !numPages}
                className="flex items-center gap-1"
                aria-label={language === 'ar' ? 'ترجمة الصفحة الحالية' : 'Translate current page'}
              >
                {isTranslating ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Languages className="h-3 w-3" />
                )}
                {!isMobile && (language === 'ar' ? 'ترجمة' : 'Translate')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={direction === 'rtl' ? 'end' : 'start'} className={direction === 'rtl' ? 'rtl' : 'ltr'}>
              <DropdownMenuLabel>
                {language === 'ar' ? 'اختر لغة الترجمة' : 'Select translation language'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filteredLanguages.map((lang) => (
                <DropdownMenuItem
                  key={lang.code}
                  onClick={() => handleTranslatePage(lang)}
                  className="cursor-pointer"
                  disabled={isTranslating}
                >
                  <span className={direction === 'rtl' ? 'ml-2' : 'mr-2'}>{lang.localName}</span>
                  <span className="text-muted-foreground">({lang.name})</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div 
        style={{ maxHeight: `${maxHeight}px`, overflow: 'auto', width: '100%' }} 
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
          <>
            {/* عرض المحتوى المترجم عندما تكون في وضع عرض الترجمة */}
            {viewMode === 'translated' && translatedPages[pageNumber] ? (
              <CustomPageRenderer 
                canvasRef={{ current: null }}
                pageNumber={pageNumber}
              />
            ) : (
              /* عرض PDF الأصلي */
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
                  scale={scale}
                  className="mx-auto"
                />
              </Document>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PDFPreview;
