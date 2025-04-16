
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
];

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string | null;
  isMarkdown?: boolean;
}

export const detectLanguage = async (text: string): Promise<string> => {
  if (!text || !text.trim()) {
    return 'en'; // Default to English for empty text
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, targetLanguage: 'en', detectionOnly: true },
    });

    if (error) {
      console.error('Language detection error:', error);
      return 'en'; // Default to English on error
    }

    return data?.detectedSourceLanguage || 'en';
  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en';
  }
};

export const translateText = async (text: string, targetLanguage: string): Promise<TranslationResult> => {
  // If text is empty or whitespace, return empty result immediately
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      isMarkdown: true
    };
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, targetLanguage, enhancedFormat: true },
    });

    if (error) {
      console.error('Translation error:', error);
      toast.error('Failed to translate text. Please try again.');
      throw new Error(error.message);
    }

    if (!data) {
      toast.error('Invalid response from translation service. Please try again.');
      throw new Error('Invalid response from translation service');
    }

    // Handle case where error might be in data
    if (data.error) {
      toast.error('Translation error: ' + data.error);
      throw new Error(data.error);
    }

    return {
      translatedText: data.translatedText || '',
      detectedSourceLanguage: data.detectedSourceLanguage,
      isMarkdown: data.isMarkdown || true,
    };
  } catch (error) {
    console.error('Error translating text:', error);
    toast.error('Failed to translate text. Please try again.');
    throw error;
  }
};
