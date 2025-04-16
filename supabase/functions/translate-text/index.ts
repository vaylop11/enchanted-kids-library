import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple translation dictionary for fallback mode
const fallbackTranslations: Record<string, Record<string, string>> = {
  "en": {
    "loading": "Loading",
    "error": "Error occurred",
    "try_again": "Please try again",
    "no_results": "No results found",
    "translate": "Translate",
    "page": "Page",
    "of": "of",
  },
  "ar": {
    "loading": "جاري التحميل",
    "error": "حدث خطأ",
    "try_again": "يرجى المحاولة مرة أخرى",
    "no_results": "لم يتم العثور على نتائج",
    "translate": "ترجمة",
    "page": "صفحة",
    "of": "من",
  },
  "fr": {
    "loading": "Chargement",
    "error": "Une erreur s'est produite",
    "try_again": "Veuillez réessayer",
    "no_results": "Aucun résultat trouvé",
    "translate": "Traduire",
    "page": "Page",
    "of": "sur",
  },
  "es": {
    "loading": "Cargando",
    "error": "Se produjo un error",
    "try_again": "Por favor, inténtelo de nuevo",
    "no_results": "No se encontraron resultados",
    "translate": "Traducir",
    "page": "Página",
    "of": "de",
  }
};

// A simple fallback translation function that uses a dictionary for common words
function fallbackTranslate(text: string, targetLanguage: string): string {
  if (!fallbackTranslations[targetLanguage]) {
    return text;  // If language not supported in fallback, return original
  }
  
  let result = text;
  
  // For each word/phrase in our dictionary, replace in the text if found
  Object.entries(fallbackTranslations["en"]).forEach(([key, value]) => {
    const targetValue = fallbackTranslations[targetLanguage][key];
    if (targetValue) {
      const regex = new RegExp(`\\b${value}\\b`, 'gi');
      result = result.replace(regex, targetValue);
    }
  });
  
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage } = await req.json();
    
    if (!text || !targetLanguage) {
      return new Response(
        JSON.stringify({ error: 'Text and target language are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if text is empty or just whitespace
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ 
          translatedText: '',
          detectedSourceLanguage: null,
          isMarkdown: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using flash model instead of pro for better rate limits

    const prompt = `Translate the following text to ${targetLanguage}. Format the output in markdown to preserve formatting, headings, and structure. Only respond with the translated text in markdown format, nothing else:

${text}`;

    try {
      const result = await model.generateContent(prompt);
      const translatedText = result.response.text();
      
      return new Response(
        JSON.stringify({ 
          translatedText,
          detectedSourceLanguage: null,
          isMarkdown: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (modelError) {
      console.error('Gemini API Error:', modelError.message);
      
      // Check if it's a quota error
      if (modelError.message && modelError.message.includes('429')) {
        // Try using the fallback dictionary translation
        const fallbackText = fallbackTranslate(text, targetLanguage);
        
        // If the text is the same as the input (meaning fallback didn't work well),
        // then return an error
        if (fallbackText === text && text.length > 20) {
          return new Response(
            JSON.stringify({ 
              error: 'Translation quota exceeded. Please try again in a few moments.',
              isQuotaError: true 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Otherwise, use our basic fallback translation
        return new Response(
          JSON.stringify({ 
            translatedText: `${fallbackText}\n\n[Note: Using simplified translation due to API limits]`,
            detectedSourceLanguage: null,
            isMarkdown: true,
            usingFallback: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw modelError;
    }
  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
