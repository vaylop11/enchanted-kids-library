
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
  detectedSourceLanguage?: string;
}

export const translateText = async (text: string, targetLanguage: string): Promise<TranslationResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text, targetLanguage },
    });

    if (error) {
      console.error('Translation error:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Error translating text:', error);
    toast.error('Failed to translate text. Please try again.');
    throw error;
  }
};
