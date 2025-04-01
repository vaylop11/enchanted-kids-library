
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
  | 'error';

export interface AnalysisProgress {
  stage: AnalysisStage;
  progress: number; // 0-100
  message: string;
}

// Cache for storing PDF text content to avoid repeated extraction
const pdfTextCache = new Map<string, string>();

/**
 * Extracts text content from a PDF file with caching support
 */
export const extractTextFromPDF = async (
  pdfUrl: string, 
  updateProgress?: (progress: AnalysisProgress) => void,
  forceReload = false
): Promise<string> => {
  try {
    // Check cache first if not forcing reload
    const cacheKey = pdfUrl;
    if (!forceReload && pdfTextCache.has(cacheKey)) {
      console.log("Using cached PDF text");
      updateProgress?.({
        stage: 'extracting',
        progress: 100,
        message: 'Using previously extracted text'
      });
      return pdfTextCache.get(cacheKey)!;
    }

    updateProgress?.({
      stage: 'extracting',
      progress: 0,
      message: 'Initializing PDF extraction...'
    });
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument(pdfUrl);
    
    // Add progress tracking for document loading
    loadingTask.onProgress = (progressData) => {
      if (progressData.total > 0) {
        const loadProgress = Math.round((progressData.loaded / progressData.total) * 20); // 20% of progress for loading
        updateProgress?.({
          stage: 'extracting',
          progress: loadProgress,
          message: 'Loading PDF document...'
        });
      }
    };
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    
    // Total pages for progress calculation
    const totalPages = pdf.numPages;
    console.log(`PDF has ${totalPages} pages to extract text from`);
    
    updateProgress?.({
      stage: 'extracting',
      progress: 20,
      message: `Starting text extraction from ${totalPages} pages...`
    });
    
    // Extract text from each page with progress tracking
    for (let i = 1; i <= totalPages; i++) {
      // Calculate progress: 20% for loading + 80% for extraction
      const extractionProgress = Math.round(20 + ((i - 1) / totalPages * 80));
      
      updateProgress?.({
        stage: 'extracting',
        progress: extractionProgress,
        message: `Extracting text from page ${i} of ${totalPages}...`
      });
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `[Page ${i}]\n${pageText}\n\n`;
      
      // Update progress after each page
      const completedProgress = Math.round(20 + (i / totalPages * 80));
      updateProgress?.({
        stage: 'extracting',
        progress: completedProgress,
        message: `Extracted page ${i} of ${totalPages}`
      });
    }
    
    updateProgress?.({
      stage: 'analyzing',
      progress: 100,
      message: 'Text extraction complete from all pages'
    });
    
    console.log(`Successfully extracted text from all ${totalPages} pages`);
    
    // Store in cache
    const extractedText = fullText.trim();
    pdfTextCache.set(cacheKey, extractedText);
    
    return extractedText;
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
  updateProgress?: (progress: AnalysisProgress) => void
): Promise<string> => {
  try {
    updateProgress?.({
      stage: 'analyzing',
      progress: 30,
      message: 'Sending PDF content to Cherif Hocine, AI PDF specialist...'
    });
    
    // Enhanced error handling for network or API issues
    let retries = 0;
    const maxRetries = 2;
    let response = null;
    
    while (retries <= maxRetries) {
      try {
        const { data, error } = await supabase.functions.invoke('analyze-pdf-with-gemini', {
          body: { pdfText, userQuestion },
        });

        if (error) {
          console.error(`Error from Gemini API (attempt ${retries + 1}):`, error);
          
          if (retries < maxRetries) {
            retries++;
            updateProgress?.({
              stage: 'analyzing',
              progress: 30,
              message: `Retrying analysis (attempt ${retries + 1})...`
            });
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          } else {
            throw error;
          }
        }
        
        response = data;
        break;
      } catch (err) {
        if (retries < maxRetries) {
          retries++;
          console.log(`Retrying after error (attempt ${retries + 1})...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          throw err;
        }
      }
    }
    
    if (!response) {
      throw new Error('Failed to get response from AI after multiple attempts');
    }
    
    updateProgress?.({
      stage: 'generating',
      progress: 70,
      message: 'Generating natural, language-matched response...'
    });
    
    // Simulate a slight delay for the UI to show the generating stage
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Analysis complete'
    });
    
    return response.response;
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

// Clear cache for a specific PDF or all PDFs
export const clearPDFTextCache = (pdfUrl?: string) => {
  if (pdfUrl) {
    pdfTextCache.delete(pdfUrl);
  } else {
    pdfTextCache.clear();
  }
};
