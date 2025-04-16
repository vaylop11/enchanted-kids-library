
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

let cachedPDFText: Record<string, string> = {};

/**
 * Extracts text content from a PDF file
 * Added cache to prevent re-extraction of PDFs that were already processed
 */
export const extractTextFromPDF = async (
  pdfUrl: string, 
  pdfId: string,
  updateProgress?: (progress: AnalysisProgress) => void,
  extractionOptions: {
    quickMode?: boolean; // If true, only extracts a portion of the document for faster response
    maxPages?: number;   // Maximum pages to extract in quick mode
  } = {}
): Promise<string> => {
  try {
    // Check if we already have the text for this PDF
    if (cachedPDFText[pdfId]) {
      console.log('Using cached PDF text');
      updateProgress?.({
        stage: 'extracting',
        progress: 100,
        message: 'Using cached PDF text'
      });
      return cachedPDFText[pdfId];
    }
    
    updateProgress?.({
      stage: 'extracting',
      progress: 0,
      message: 'Initializing PDF extraction...'
    });
    
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    let fullText = '';
    
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
    
    // Cache the extracted text
    cachedPDFText[pdfId] = fullText.trim();
    
    updateProgress?.({
      stage: 'analyzing',
      progress: 100,
      message: 'Text extraction complete'
    });
    
    return fullText.trim();
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
    
    const { data, error } = await supabase.functions.invoke('analyze-pdf-with-gemini', {
      body: { pdfText, userQuestion, previousChat },
    });

    if (error) {
      console.error('Gemini API error:', error);
      updateProgress?.({
        stage: 'error',
        progress: 0,
        message: 'Failed to analyze PDF content'
      });
      throw error;
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
    
    return data.response;
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

// Clear the cache for a specific PDF or all PDFs
export const clearPDFTextCache = (pdfId?: string) => {
  if (pdfId) {
    delete cachedPDFText[pdfId];
  } else {
    cachedPDFText = {};
  }
};
