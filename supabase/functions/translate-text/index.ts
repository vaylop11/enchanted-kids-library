
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported language codes
const LANGUAGE_CODES = {
  'en': 'English',
  'ar': 'Arabic', 
  'zh': 'Chinese (Simplified)',
  'fr': 'French',
  'de': 'German',
  'hi': 'Hindi',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'es': 'Spanish'
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, enhancedFormat } = await req.json();
    
    if (!text || !targetLanguage) {
      throw new Error('Text and target language are required');
    }
    
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API Key');
    }
    
    // Get the language name from the code
    const languageName = LANGUAGE_CODES[targetLanguage] || targetLanguage;
    
    // Determine if the input is markdown
    const isMarkdown = text.includes('```') || text.includes('#') || text.includes('**') || text.includes('*');
    
    // Build the prompt
    let prompt = "";
    
    if (enhancedFormat && isMarkdown) {
      prompt = `Translate the following markdown text into ${languageName}. Preserve all markdown formatting including code blocks, headers, lists, and emphasis. Don't translate content inside code blocks.

Text to translate:
${text}`;
    } else {
      prompt = `Translate the following text into ${languageName}:

${text}`;
    }
    
    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error response:', data);
      throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
    }

    // Extract the translation text
    const translatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Return the translation
    return new Response(JSON.stringify({
      translatedText,
      isMarkdown: enhancedFormat && isMarkdown
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in translate-text function:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
