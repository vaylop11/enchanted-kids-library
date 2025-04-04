
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

/**
 * Extracts text content from a PDF file
 */
export const extractTextFromPDF = async (
  pdfUrl: string, 
  updateProgress?: (progress: AnalysisProgress) => void
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
    
    // Sample strategy - extract first few pages and last few pages for faster response
    const maxPagesToExtract = Math.min(10, totalPages);
    const pagesToExtract = new Set<number>();
    
    // Add first pages
    for (let i = 1; i <= Math.ceil(maxPagesToExtract / 2); i++) {
      pagesToExtract.add(i);
    }
    
    // Add last pages if there are more than maxPagesToExtract pages
    if (totalPages > maxPagesToExtract) {
      for (let i = totalPages - Math.floor(maxPagesToExtract / 2) + 1; i <= totalPages; i++) {
        pagesToExtract.add(i);
      }
    }
    
    // Extract text from selected pages
    let extractedPages = 0;
    for (const pageNum of pagesToExtract) {
      updateProgress?.({
        stage: 'extracting',
        progress: Math.round(extractedPages / pagesToExtract.size * 100),
        message: `Extracting key text from page ${pageNum}...`
      });
      
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `[Page ${pageNum}] ${pageText}\n\n`;
      
      extractedPages++;
    }
    
    updateProgress?.({
      stage: 'analyzing',
      progress: 100,
      message: 'Sample text extraction complete'
    });
    
    // Add a note about partial extraction for large documents
    if (totalPages > maxPagesToExtract) {
      fullText = `[Note: This is a partial extraction of ${pagesToExtract.size} pages from a ${totalPages}-page document]\n\n${fullText}`;
    }
    
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
  updateProgress?: (progress: AnalysisProgress) => void
): Promise<string> => {
  try {
    updateProgress?.({
      stage: 'analyzing',
      progress: 30,
      message: 'Sending PDF content to Gemini AI...'
    });
    
    const { data, error } = await supabase.functions.invoke('analyze-pdf-with-gemini', {
      body: { pdfText, userQuestion },
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
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
