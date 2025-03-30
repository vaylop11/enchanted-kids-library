
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

    // Detect if question is in Arabic
    const containsArabic = /[\u0600-\u06FF]/.test(userQuestion);
    const responseLanguage = containsArabic ? 'Arabic' : 'English';

    // Build context and prompt
    const prompt = `
      You are an AI assistant that helps users analyze PDF documents and answer questions about them.
      
      Here is the text content from a PDF document:
      """
      ${pdfText}
      """
      
      User question: ${userQuestion}
      
      Provide a relevant, accurate, and helpful response based on the PDF content. If the answer cannot be determined from the PDF content, clearly state that.
      
      IMPORTANT: The user's question is in ${containsArabic ? 'Arabic' : 'English'}. You MUST respond in ${responseLanguage}.
    `;

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
          maxOutputTokens: 2048,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
    }

    // Extract the response text
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                        containsArabic ? 
                        "عذراً، لم أتمكن من إنشاء استجابة بناءً على محتوى ملف PDF." : 
                        "Sorry, I couldn't generate a response based on the PDF content.";

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-pdf-with-gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
