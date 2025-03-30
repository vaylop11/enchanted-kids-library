
import { supabase } from "@/integrations/supabase/client";
import * as pdfjs from "pdfjs-dist";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

/**
 * Extracts text content from a PDF file
 */
export const extractTextFromPDF = async (pdfUrl: string): Promise<string> => {
  try {
    const pdf = await pdfjs.getDocument(pdfUrl).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + ' ';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Analyzes PDF content and answers a user question using Gemini AI
 */
export const analyzePDFWithGemini = async (pdfText: string, userQuestion: string): Promise<string> => {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-pdf-with-gemini', {
      body: { pdfText, userQuestion },
    });

    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error('Error analyzing PDF with Gemini:', error);
    throw new Error('Failed to analyze PDF content');
  }
};

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
