
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

    if (!pdfText || !userQuestion) {
      throw new Error('Missing required parameters: pdfText or userQuestion');
    }

    console.log(`Processing question: "${userQuestion.substring(0, 50)}..." with PDF text of length ${pdfText.length}`);

    // Enhanced prompt with more emphasis on accuracy and better page reference handling
    const prompt = `
      You are Cherif Hocine, an advanced AI assistant specialized in analyzing PDFs. When given a PDF document, read its content and respond in a structured, concise, and insightful manner. Answer questions based on the document, extract key details, and summarize sections as needed. Maintain accuracy and clarity. Always reply in the same language as the question, ensuring a natural and contextually relevant conversation.
      
      The PDF content includes page markers [Page X] to help you reference specific pages in your answers when relevant.
      
      Here is the text content from a PDF document:
      """
      ${pdfText}
      """
      
      User question: ${userQuestion}
      
      Provide a relevant, accurate, and helpful response based on the PDF content. If the answer requires referencing specific pages, mention the page numbers in your response. If the answer cannot be determined from the PDF content, clearly state that.
    `;

    console.log("Sending request to Gemini API");

    // Call Gemini API with optimized parameters for better reliability
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
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error response:", JSON.stringify(errorData));
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      console.error("Gemini API returned no candidates:", JSON.stringify(data));
      throw new Error("Gemini API returned no candidates");
    }

    // Extract the response text with better error handling
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "Sorry, I couldn't generate a response based on the PDF content.";

    console.log("Successfully received response from Gemini API");

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-pdf-with-gemini function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack || "No additional details available"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
