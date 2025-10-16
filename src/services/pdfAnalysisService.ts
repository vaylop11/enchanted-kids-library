
import { supabase } from "@/integrations/supabase/client";
import * as pdfjs from "pdfjs-dist";
import { toast } from "sonner";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Analysis stages for the progress indicator
export type AnalysisStage = 
  | 'extracting' 
  | 'analyzing' 
  | 'generating' 
  | 'complete' 
  | 'error'
  | 'waiting'; // Added waiting stage

export interface AnalysisProgress {
  stage: AnalysisStage;
  progress: number; // 0-100
  message: string;
}

interface CachedPDFData {
  text: string;
  timestamp: number;
  pageCount: number;
  metadata?: {
    hasHeaders: boolean;
    hasTables: boolean;
    language?: string;
  };
}

let cachedPDFText: Record<string, CachedPDFData> = {};
const CACHE_EXPIRY = 30 * 60 * 1000; // 30 minutes

/**
 * Pre-process extracted text to improve quality
 */
const preprocessText = (text: string): string => {
  // Remove excessive whitespace
  let processed = text.replace(/\s+/g, ' ');
  
  // Remove special characters that might interfere
  processed = processed.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  
  // Normalize line breaks
  processed = processed.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove repeated dots/dashes (common in TOC)
  processed = processed.replace(/\.{3,}/g, '...');
  processed = processed.replace(/-{3,}/g, '---');
  
  return processed.trim();
};

/**
 * Detect document structure and extract metadata
 */
const analyzeDocumentStructure = (text: string): CachedPDFData['metadata'] => {
  const hasHeaders = /^(Chapter|Section|\d+\.).*$/m.test(text);
  const hasTables = /\|.*\|/.test(text) || /\t.*\t/.test(text);
  
  // Simple language detection
  const arabicChars = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const totalChars = text.length;
  const language = arabicChars / totalChars > 0.3 ? 'ar' : 'en';
  
  return { hasHeaders, hasTables, language };
};

/**
 * Extracts text content from a PDF file with enhanced caching and pre-processing
 */
export const extractTextFromPDF = async (
  pdfUrl: string, 
  pdfId: string,
  updateProgress?: (progress: AnalysisProgress) => void,
  extractionOptions: {
    quickMode?: boolean;
    maxPages?: number;
    specificPage?: number;
  } = {}
): Promise<string> => {
  try {
    // Check cache validity (not expired and not extracting specific page)
    if (!extractionOptions.specificPage && cachedPDFText[pdfId]) {
      const cached = cachedPDFText[pdfId];
      const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY;
      
      if (!isExpired) {
        console.log('Using cached PDF text (cached at:', new Date(cached.timestamp).toLocaleString(), ')');
        updateProgress?.({
          stage: 'extracting',
          progress: 100,
          message: 'Using cached PDF text'
        });
        return cached.text;
      } else {
        console.log('Cache expired, re-extracting PDF text');
        delete cachedPDFText[pdfId];
      }
    }
    
    updateProgress?.({
      stage: 'extracting',
      progress: 0,
      message: 'Initializing PDF extraction...'
    });
    
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    const totalPages = pdf.numPages;
    let fullText = '';
    
    const { quickMode, maxPages, specificPage } = extractionOptions;
    
    // If specificPage is provided, only extract that page
    if (specificPage && specificPage > 0 && specificPage <= pdf.numPages) {
      const page = await pdf.getPage(specificPage);
      const textContent = await page.getTextContent();
      fullText = textContent.items.map((item: any) => item.str).join(' ');
    } else {
      // Total pages for progress calculation
      const totalPages = pdf.numPages;
      const { quickMode, maxPages } = extractionOptions;
      
      // Always process all pages unless quickMode is explicitly set to true
      const pagesToProcess = quickMode && maxPages ? Math.min(maxPages, totalPages) : totalPages;
      
      for (let i = 1; i <= pagesToProcess; i++) {
        updateProgress?.({
          stage: 'extracting',
          progress: Math.round((i - 1) / pagesToProcess * 100),
          message: `Extracting text from page ${i} of ${quickMode ? `${pagesToProcess} (quick mode)` : totalPages}...`
        });
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
        
        // Update progress after each page
        updateProgress?.({
          stage: 'extracting',
          progress: Math.round(i / pagesToProcess * 100),
          message: `Extracted page ${i}`
        });
        
        // Only break early if quickMode is explicitly set to true
        if (quickMode && fullText.length > 5000 && i >= Math.min(5, pagesToProcess)) {
          fullText += `\n\n[Note: Only the first ${i} pages were analyzed for quick response]`;
          break;
        }
      }
    }
    
    // Pre-process the extracted text
    const processedText = preprocessText(fullText);
    
    // Analyze document structure
    const metadata = analyzeDocumentStructure(processedText);
    
    // Only cache if we're not extracting a specific page
    if (!specificPage) {
      cachedPDFText[pdfId] = {
        text: processedText,
        timestamp: Date.now(),
        pageCount: totalPages,
        metadata
      };
      console.log(`Cached PDF text for ${pdfId}:`, {
        length: processedText.length,
        pages: totalPages,
        metadata
      });
    }
    
    updateProgress?.({
      stage: 'analyzing',
      progress: 100,
      message: 'Text extraction complete'
    });
    
    return processedText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    updateProgress?.({
      stage: 'error',
      progress: 0,
      message: 'Failed to extract text from PDF'
    });
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Analyzes PDF content and answers a user question using Gemini AI
 */
export const analyzePDFWithGemini = async (
  pdfText: string, 
  userQuestion: string,
  updateProgress?: (progress: AnalysisProgress) => void,
  previousChat: any[] = []
): Promise<string> => {
  try {
    // First set the waiting state before starting the analysis
    updateProgress?.({
      stage: 'waiting',
      progress: 20,
      message: 'Preparing your request...'
    });
    
    // Short delay to show the waiting state
    await new Promise(resolve => setTimeout(resolve, 800));
    
    updateProgress?.({
      stage: 'analyzing',
      progress: 30,
      message: 'Sending PDF content to Gemini AI...'
    });
    
    // Add retry mechanism for better reliability
    let retries = 0;
    const maxRetries = 2;
    
    while (retries <= maxRetries) {
      try {
        const response = await supabase.functions.invoke('analyze-pdf-with-gemini', {
          body: { 
            pdfText: pdfText.substring(0, 100000), // Limit text size to avoid payload issues
            userQuestion, 
            previousChat 
          },
        });
        
        if (response.error) {
          throw response.error;
        }
        
        if (!response.data) {
          throw new Error('No response data received');
        }
        
        updateProgress?.({
          stage: 'generating',
          progress: 70,
          message: 'Generating response...'
        });
        
        updateProgress?.({
          stage: 'complete',
          progress: 100,
          message: 'Analysis complete'
        });
        
        return response.data.response || "I couldn't generate a response based on the PDF content.";
      } catch (err) {
        retries++;
        if (retries > maxRetries) {
          throw err;
        }
        
        // Wait a bit longer between retries
        await new Promise(resolve => setTimeout(resolve, 1000 * retries));
        
        updateProgress?.({
          stage: 'analyzing',
          progress: 30,
          message: `Retrying... (Attempt ${retries} of ${maxRetries})`
        });
      }
    }
    
    throw new Error('Failed to analyze PDF content after multiple attempts');
  } catch (error) {
    console.error('Error analyzing PDF with Gemini:', error);
    updateProgress?.({
      stage: 'error',
      progress: 0,
      message: error instanceof Error ? error.message : 'Failed to analyze PDF content'
    });
    throw new Error('Failed to analyze PDF content');
  }
};

/**
 * Clear the cache for a specific PDF or all PDFs
 */
export const clearPDFTextCache = (pdfId?: string) => {
  if (pdfId) {
    delete cachedPDFText[pdfId];
    console.log(`Cleared cache for PDF: ${pdfId}`);
  } else {
    cachedPDFText = {};
    console.log('Cleared all PDF cache');
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  const stats = Object.entries(cachedPDFText).map(([id, data]) => ({
    id,
    size: data.text.length,
    pages: data.pageCount,
    age: Date.now() - data.timestamp,
    metadata: data.metadata
  }));
  
  return {
    totalCached: stats.length,
    totalSize: stats.reduce((sum, s) => sum + s.size, 0),
    entries: stats
  };
};
