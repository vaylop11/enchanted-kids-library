
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

let isTranslationCoolingDown = false;
const COOLDOWN_TIME = 3000; // 3 seconds cooldown

export const translateText = async (text: string, targetLanguage: string): Promise<TranslationResult> => {
  // If text is empty or whitespace, return empty result immediately
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      isMarkdown: true
    };
  }

  // Check if we're in cooldown period
  if (isTranslationCoolingDown) {
    toast.warning('Please wait a moment before trying again.');
    throw new Error('Translation cooldown period. Please wait a moment before trying again.');
  }

  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, targetLanguage },
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

    // Check for specific quota error
    if (data.error && data.isQuotaError) {
      console.warn('Translation quota exceeded, cooling down');
      isTranslationCoolingDown = true;
      
      // Set a timer to reset the cooldown
      setTimeout(() => {
        isTranslationCoolingDown = false;
      }, COOLDOWN_TIME);
      
      toast.warning('Translation quota exceeded. Please try again in a few moments.');
      throw new Error('Translation quota exceeded');
    }

    // Handle case where error might be in data but not detected above
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
    
    // Don't show toast if it's a cooldown error (already shown above)
    if (!isTranslationCoolingDown) {
      toast.error('Failed to translate text. Please try again.');
    }
    
    throw error;
  }
};
