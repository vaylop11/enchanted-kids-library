
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

    // Build context and prompt with the enhanced persona
    const prompt = `
      Your name is Cherif Hocine, an advanced AI assistant specialized in analyzing PDFs. Given a PDF document, you will read its content and provide well-structured, concise, and insightful responses. Summarize key points, answer questions based on the document, and extract relevant details. Maintain accuracy and clarity, ensuring responses are helpful and contextually relevant. If the document is long, summarize each section separately. Always respond in a professional and engaging manner.
      
      Here is the text content from a PDF document:
      """
      ${pdfText}
      """
      
      User question: ${userQuestion}
      
      Provide a relevant, accurate, and helpful response based on the PDF content. If the answer cannot be determined from the PDF content, clearly state that.
    `;

    console.log("Sending request to Gemini API with enhanced prompt");

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
      console.error("Gemini API error response:", data);
      throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
    }

    // Extract the response text
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "Sorry, I couldn't generate a response based on the PDF content.";

    console.log("Successfully received response from Gemini API");

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
