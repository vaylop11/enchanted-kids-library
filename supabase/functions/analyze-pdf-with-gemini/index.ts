
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

    // Detect if question is in Arabic
    const containsArabic = /[\u0600-\u06FF]/.test(userQuestion);
    const responseLanguage = containsArabic ? 'Arabic' : 'English';
    
    console.log(`Processing question in ${responseLanguage}. PDF content length: ${pdfText.length} characters`);

    // Build context and prompt with stricter instructions
    const prompt = `
      You are an AI assistant that helps users analyze PDF documents and answer questions about them.
      
      Here is the text content from a PDF document:
      """
      ${pdfText}
      """
      
      User question: ${userQuestion}
      
      Analyze the PDF content carefully and provide a detailed, relevant response to the user's question.
      If the question cannot be answered based on the PDF content, explain why and what information is missing.
      
      IMPORTANT: The user's question is in ${containsArabic ? 'Arabic' : 'English'}. 
      You MUST respond in ${responseLanguage} only.
      If you're responding in Arabic, use proper Arabic grammar and vocabulary.
    `;

    // Call Gemini API with improved parameters
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
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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

    return new Response(JSON.stringify({ response: generatedText }), {
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
