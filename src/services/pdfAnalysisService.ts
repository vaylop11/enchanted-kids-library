
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

export interface AnalysisResult {
  response: string;
  isRTL?: boolean;
}

/**
 * Extracts text content from a PDF file
 */
export const extractTextFromPDF = async (
  pdfUrl: string, 
  updateProgress?: (progress: AnalysisProgress) => void,
  pageNum?: number
): Promise<string> => {
  try {
    updateProgress?.({
      stage: 'extracting',
      progress: 0,
      message: 'Initializing PDF extraction...'
    });
    
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    let fullText = '';
    
    // Total pages for progress calculation
    const totalPages = pdf.numPages;
    
    // Extract text from a specific page if pageNum is specified, otherwise extract all pages
    if (pageNum !== undefined) {
      updateProgress?.({
        stage: 'extracting',
        progress: 25,
        message: `Extracting text from page ${pageNum}...`
      });
      
      if (pageNum > 0 && pageNum <= totalPages) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        fullText = textContent.items.map((item: any) => item.str).join(' ');
        
        updateProgress?.({
          stage: 'extracting',
          progress: 100,
          message: `Extracted text from page ${pageNum}`
        });
      } else {
        throw new Error(`Invalid page number: ${pageNum}. Document has ${totalPages} pages.`);
      }
    } else {
      // Extract all pages
      for (let i = 1; i <= totalPages; i++) {
        updateProgress?.({
          stage: 'extracting',
          progress: Math.round((i - 1) / totalPages * 100),
          message: `Extracting text from page ${i} of ${totalPages}...`
        });
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
        
        // Update progress after each page
        updateProgress?.({
          stage: 'extracting',
          progress: Math.round(i / totalPages * 100),
          message: `Extracted page ${i} of ${totalPages}`
        });
      }
    }
    
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
  pageNumber?: number,
  totalPages?: number
): Promise<AnalysisResult> => {
  try {
    updateProgress?.({
      stage: 'analyzing',
      progress: 30,
      message: 'Sending PDF content to Gemini AI...'
    });
    
    const { data, error } = await supabase.functions.invoke('analyze-pdf-with-gemini', {
      body: { pdfText, userQuestion, pageNumber, totalPages },
    });

    if (error) {
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
    
    // Simulate a slight delay for the UI to show the generating stage
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProgress?.({
      stage: 'complete',
      progress: 100,
      message: 'Analysis complete'
    });
    
    return { 
      response: data.response,
      isRTL: data.isRTL
    };
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
 * Extract text from a specific page of a PDF
 */
export const extractTextFromPDFPage = async (
  pdfUrl: string,
  pageNumber: number,
  updateProgress?: (progress: AnalysisProgress) => void
): Promise<{ text: string, totalPages: number }> => {
  try {
    updateProgress?.({
      stage: 'extracting',
      progress: 0,
      message: `Initializing extraction of page ${pageNumber}...`
    });
    
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    const totalPages = pdf.numPages;
    
    if (pageNumber < 1 || pageNumber > totalPages) {
      throw new Error(`Invalid page number: ${pageNumber}. Document has ${totalPages} pages.`);
    }
    
    updateProgress?.({
      stage: 'extracting',
      progress: 50,
      message: `Extracting text from page ${pageNumber}...`
    });
    
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items.map((item: any) => item.str).join(' ');
    
    updateProgress?.({
      stage: 'extracting',
      progress: 100,
      message: `Completed extraction of page ${pageNumber}`
    });
    
    return { text, totalPages };
  } catch (error) {
    console.error(`Error extracting text from page ${pageNumber}:`, error);
    updateProgress?.({
      stage: 'error',
      progress: 0,
      message: `Failed to extract text from page ${pageNumber}`
    });
    throw error;
  }
};

/**
 * Translate a specific page of a PDF to the target language
 */
export const translatePDFPage = async (
  pdfUrl: string,
  pageNumber: number,
  targetLanguage: string,
  targetCode: string,
  updateProgress?: (progress: AnalysisProgress) => void
): Promise<{ translatedText: string, isRTL: boolean }> => {
  try {
    updateProgress?.({
      stage: 'extracting',
      progress: 0,
      message: `Preparing to translate page ${pageNumber}...`
    });
    
    // First extract the text from the specific page
    const { text, totalPages } = await extractTextFromPDFPage(pdfUrl, pageNumber, updateProgress);
    
    if (!text || text.trim().length < 10) {
      throw new Error(`Not enough text content on page ${pageNumber} to translate.`);
    }
    
    updateProgress?.({
      stage: 'analyzing',
      progress: 40,
      message: `Translating page ${pageNumber} to ${targetLanguage}...`
    });
    
    // Create the translation prompt
    const translatePrompt = `Translate to ${targetLanguage} (${targetCode})
Provide a complete and accurate translation of this page ${pageNumber} of ${totalPages}.
Preserve the original document structure and formatting.
Your response should ONLY contain the translated text, no additional comments.`;
    
    // Call Gemini to translate the page
    const result = await analyzePDFWithGemini(
      text, 
      translatePrompt, 
      updateProgress,
      pageNumber,
      totalPages
    );
    
    updateProgress?.({
      stage: 'complete',
      progress: 100,
      message: `Translation of page ${pageNumber} complete`
    });
    
    return {
      translatedText: result.response,
      isRTL: !!result.isRTL
    };
  } catch (error) {
    console.error(`Error translating page ${pageNumber}:`, error);
    updateProgress?.({
      stage: 'error',
      progress: 0,
      message: `Failed to translate page ${pageNumber}`
    });
    throw error;
  }
};
