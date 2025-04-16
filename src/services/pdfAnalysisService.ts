
import { supabaseUntyped } from "@/integrations/supabase/client";
import { ChatMessage } from "@/services/pdfStorage";

export type AnalysisStage = 'extracting' | 'analyzing' | 'generating' | 'completed' | 'waiting' | 'error';

export interface AnalysisProgress {
  stage: AnalysisStage;
  progress: number;
  message: string;
}

interface ExtractionOptions {
  quickMode?: boolean;
  maxPages?: number;
  specificPage?: number;
}

export const extractTextFromPDF = async (
  pdfUrl: string,
  pdfId: string,
  updateProgress?: (progress: AnalysisProgress) => void,
  options: ExtractionOptions = {}
): Promise<string> => {
  const { quickMode = false, maxPages = 0, specificPage } = options;

  try {
    const { data, error } = await supabaseUntyped.functions.invoke('extract-pdf-text', {
      body: {
        pdfUrl,
        pdfId,
        quickMode,
        maxPages,
        specificPage
      }
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw new Error(`Failed to extract PDF text: ${error.message}`);
    }

    if (!data || !data.text) {
      throw new Error('Invalid response from extraction service');
    }

    return data.text;
  } catch (error) {
    console.error('Error in extractTextFromPDF:', error);
    throw error;
  }
};

export const analyzePDFWithGemini = async (
  text: string,
  query: string,
  updateProgress?: (progress: AnalysisProgress) => void,
  previousMessages: ChatMessage[] = [],
  detectedLanguage: string = 'en'
): Promise<string> => {
  if (!text || !query) {
    throw new Error('Missing PDF text or query');
  }

  try {
    // Update progress if the callback is provided
    if (updateProgress) {
      updateProgress({
        stage: 'analyzing',
        progress: 60,
        message: 'Sending query to AI model...'
      });
    }

    const { data, error } = await supabaseUntyped.functions.invoke('analyze-pdf-with-gemini', {
      body: {
        text,
        query,
        previousResponses: previousMessages.map(m => m.content),
        responseLanguage: detectedLanguage
      }
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw new Error(`Failed to analyze PDF: ${error.message}`);
    }

    if (!data || !data.response) {
      throw new Error('Invalid response from AI service');
    }

    // Update progress
    if (updateProgress) {
      updateProgress({
        stage: 'completed',
        progress: 100,
        message: 'Analysis complete'
      });
    }

    return data.response;
  } catch (error) {
    console.error('Error in analyzePDFWithGemini:', error);
    throw error;
  }
};
