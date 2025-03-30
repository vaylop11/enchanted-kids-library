
import { supabase } from "@/integrations/supabase/client";
import * as pdfjs from "pdfjs-dist";
import { toast } from "sonner";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Analysis stages for the progress indicator
export enum AnalysisStage {
  NotStarted = 'not_started',
  Extracting = 'extracting', 
  Analyzing = 'analyzing', 
  Generating = 'generating', 
  Complete = 'complete', 
  Error = 'error'
}

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
      stage: AnalysisStage.Extracting,
      progress: 0,
      message: 'Initializing PDF extraction...'
    });
    
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    let fullText = '';
    
    // Total pages for progress calculation
    const totalPages = pdf.numPages;
    
    for (let i = 1; i <= totalPages; i++) {
      updateProgress?.({
        stage: AnalysisStage.Extracting,
        progress: Math.round((i - 1) / totalPages * 100),
        message: `Extracting text from page ${i} of ${totalPages}...`
      });
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
      
      // Update progress after each page
      updateProgress?.({
        stage: AnalysisStage.Extracting,
        progress: Math.round(i / totalPages * 100),
        message: `Extracted page ${i} of ${totalPages}`
      });
    }
    
    updateProgress?.({
      stage: AnalysisStage.Analyzing,
      progress: 100,
      message: 'Text extraction complete'
    });
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    updateProgress?.({
      stage: AnalysisStage.Error,
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
      stage: AnalysisStage.Analyzing,
      progress: 30,
      message: 'Sending PDF content to Gemini AI...'
    });
    
    const { data, error } = await supabase.functions.invoke('analyze-pdf-with-gemini', {
      body: { pdfText, userQuestion },
    });

    if (error) {
      updateProgress?.({
        stage: AnalysisStage.Error,
        progress: 0,
        message: 'Failed to analyze PDF content'
      });
      throw error;
    }
    
    updateProgress?.({
      stage: AnalysisStage.Generating,
      progress: 70,
      message: 'Generating response...'
    });
    
    // Simulate a slight delay for the UI to show the generating stage
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProgress?.({
      stage: AnalysisStage.Complete,
      progress: 100,
      message: 'Analysis complete'
    });
    
    return data.response;
  } catch (error) {
    console.error('Error analyzing PDF with Gemini:', error);
    updateProgress?.({
      stage: AnalysisStage.Error,
      progress: 0,
      message: error instanceof Error ? error.message : 'Failed to analyze PDF content'
    });
    throw new Error('Failed to analyze PDF content');
  }
};
