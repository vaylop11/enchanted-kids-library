
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
let translationAttempts = 0;
const MAX_ATTEMPTS = 3;

// Simple cache to avoid redundant translations
const translationCache: Record<string, TranslationResult> = {};

export const translateText = async (text: string, targetLanguage: string): Promise<TranslationResult> => {
  // If text is empty or whitespace, return empty result immediately
  if (!text || !text.trim()) {
    return {
      translatedText: '',
      isMarkdown: true
    };
  }

  // Generate cache key
  const cacheKey = `${text.substring(0, 100)}_${targetLanguage}`;
  
  // Check cache first
  if (translationCache[cacheKey]) {
    console.log('Using cached translation');
    return translationCache[cacheKey];
  }

  // Check if we're in cooldown period
  if (isTranslationCoolingDown) {
    toast.warning('Please wait a moment before trying again.');
    throw new Error('Translation cooldown period. Please wait a moment before trying again.');
  }

  // If text is too long, truncate it for API call and note the truncation
  let textToTranslate = text;
  let truncationNotice = '';
  
  if (text.length > 2000) {
    textToTranslate = text.substring(0, 2000);
    truncationNotice = '\n\n[Note: The text was truncated due to length limits. Only the first 2000 characters were translated.]';
  }

  try {
    translationAttempts++;
    
    const { data, error } = await supabase.functions.invoke('translate-text', {
      body: { text: textToTranslate, targetLanguage },
    });

    if (error) {
      console.error('Translation error:', error);
      
      // Reset attempts after successful call or max attempts reached
      if (translationAttempts >= MAX_ATTEMPTS) {
        enterCooldownMode();
        translationAttempts = 0;
        toast.error('Too many translation attempts. Please try again in a few moments.');
        throw new Error('Too many translation attempts');
      }
      
      toast.error('Failed to translate text. Please try again.');
      throw new Error(error.message);
    }

    // Reset attempts on success
    translationAttempts = 0;

    if (!data) {
      toast.error('Invalid response from translation service. Please try again.');
      throw new Error('Invalid response from translation service');
    }

    // Check for specific quota error
    if (data.error && data.isQuotaError) {
      console.warn('Translation quota exceeded, cooling down');
      enterCooldownMode();
      
      toast.warning('Translation quota exceeded. Please try again in a few moments.');
      throw new Error('Translation quota exceeded');
    }

    // Handle case where error might be in data but not detected above
    if (data.error) {
      toast.error('Translation error: ' + data.error);
      throw new Error(data.error);
    }

    const result = {
      translatedText: (data.translatedText || '') + truncationNotice,
      detectedSourceLanguage: data.detectedSourceLanguage,
      isMarkdown: data.isMarkdown || true,
    };
    
    // Cache the result
    translationCache[cacheKey] = result;

    return result;
  } catch (error) {
    console.error('Error translating text:', error);
    
    // Don't show toast if it's a cooldown error (already shown above)
    if (!isTranslationCoolingDown) {
      toast.error('Failed to translate text. Please try again.');
    }
    
    throw error;
  }
};

// Helper function to enter cooldown mode
function enterCooldownMode() {
  isTranslationCoolingDown = true;
  
  // Set a timer to reset the cooldown
  setTimeout(() => {
    isTranslationCoolingDown = false;
  }, COOLDOWN_TIME);
}

// Clear translation cache
export const clearTranslationCache = () => {
  Object.keys(translationCache).forEach(key => {
    delete translationCache[key];
  });
};
