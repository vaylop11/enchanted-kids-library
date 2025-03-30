
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, userQuestion } = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API Key');
    }

    // Verify we have PDF content to work with
    if (!pdfText || typeof pdfText !== 'string' || pdfText.trim().length < 10) {
      // Detect language for error response
      const containsArabic = /[\u0600-\u06FF]/.test(userQuestion);
      const errorMessage = containsArabic
        ? "عذراً، لم يتم توفير محتوى PDF كافي للتحليل. يرجى التأكد من أن الملف تم تحميله بشكل صحيح."
        : "Sorry, insufficient PDF content was provided for analysis. Please ensure the file was uploaded correctly.";
      
      return new Response(JSON.stringify({ response: errorMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Detect if question is in Arabic or contains a language directive
    const containsArabic = /[\u0600-\u06FF]/.test(userQuestion);
    let responseLanguage = containsArabic ? 'Arabic' : 'English';
    
    // Define RTL languages
    const rtlLanguages = ['Arabic', 'Hebrew', 'Persian', 'Urdu'];
    
    // Check if the request is a translation request and extract target language
    const translationMatch = userQuestion.match(/Translate.*to\s+(\w+)\s+\((\w+)\)/i);
    if (translationMatch) {
      responseLanguage = translationMatch[1]; // Use the target language from the prompt
      console.log(`Translation request detected. Target language: ${responseLanguage}`);
    }
    
    // Determine if target language is RTL
    const isTargetRTL = rtlLanguages.includes(responseLanguage);
    
    console.log(`Processing request in ${responseLanguage}. PDF content length: ${pdfText.length} characters`);

    // Increase temperature for translation tasks to improve fluency
    const isTranslation = userQuestion.toLowerCase().includes('translate');
    const temperature = isTranslation ? 0.4 : 0.3;
    
    // Adjust max tokens based on task - translations need more space
    const maxOutputTokens = isTranslation ? 8192 : 2048;

    // Build an enhanced prompt for better RTL handling
    let enhancedPrompt = userQuestion;
    
    if (isTranslation) {
      enhancedPrompt = `${userQuestion}\n\n` +
        `Important: If translating to ${responseLanguage} ${isTargetRTL ? '(which is a right-to-left language)' : ''}, ` +
        `please ensure proper text direction, punctuation, and formatting consistent with the target language conventions.`;
    }

    // Call Gemini API with improved parameters
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: enhancedPrompt + "\n\n" + pdfText }]
        }],
        generationConfig: {
          temperature: temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxOutputTokens,
        }
      }),
    });

    const data = await response.json();
    console.log("Gemini API response status:", response.status);
    
    if (!response.ok) {
      console.error(`Gemini API error (${response.status}):`, JSON.stringify(data));
      
      // Provide language-appropriate error message
      const errorMessage = containsArabic
        ? "عذراً، حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى لاحقاً."
        : "Sorry, an error occurred while connecting to the AI service. Please try again later.";
      
      return new Response(JSON.stringify({ 
        response: errorMessage,
        error: data.error || "API error" 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if we have a valid response
    if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid or empty response from Gemini API:", JSON.stringify(data));
      
      // Default fallback response in the appropriate language
      const fallbackMessage = containsArabic
        ? "عذراً، لم أتمكن من تحليل محتوى ملف PDF بشكل صحيح. يرجى التأكد من أن الملف يحتوي على نص قابل للقراءة وحاول مرة أخرى."
        : "Sorry, I couldn't properly analyze the PDF content. Please ensure the file contains readable text and try again.";
      
      return new Response(JSON.stringify({ response: fallbackMessage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the response text
    const generatedText = data.candidates[0].content.parts[0].text;
    console.log(`Generated response of length: ${generatedText.length} characters`);

    // Prepare the response object
    const responseObject = { 
      response: generatedText,
      isRTL: isTargetRTL || /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/.test(generatedText)
    };

    return new Response(JSON.stringify(responseObject), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-pdf-with-gemini function:', error);
    
    // Try to determine language from user question if available
    let containsArabic = false;
    try {
      const { userQuestion } = await req.json();
      containsArabic = /[\u0600-\u06FF]/.test(userQuestion);
    } catch (e) {
      // If we can't parse the request, default to English
      containsArabic = false;
    }
    
    const errorMessage = containsArabic
      ? "حدث خطأ أثناء معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
      : "An error occurred while processing your request. Please try again later.";
    
    return new Response(JSON.stringify({ 
      response: errorMessage,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
