
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
    const { pdfText, userQuestion, previousChat, skipExtraction } = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API Key');
    }

    // Build context with optional previous chat messages
    let chatContext = "";
    if (previousChat && previousChat.length > 0) {
      // Include up to 10 recent exchanges for context
      const recentMessages = previousChat.slice(-10);
      chatContext = "Previous conversation:\n" + 
        recentMessages.map(m => `${m.isUser ? "User" : "Assistant"}: ${m.content}`).join("\n") +
        "\n\n";
    }

    // Build prompt with improved instructions
    let prompt;
    
    // If skipExtraction is true, we don't use PDF text but instead directly answer the question
    if (skipExtraction) {
      prompt = `
        You are an AI assistant that helps users analyze and understand documents.
        
        ${chatContext}
        
        User question: ${userQuestion}
        
        Please provide a helpful, informative response based on your knowledge. If you don't know the answer for certain, provide your best estimate and be clear about any limitations.
        Make sure your response is well-structured and easy to understand.
      `;
    } else {
      // Original prompt with PDF text
      prompt = `
        You are an AI assistant that helps users analyze PDF documents and answer questions about them.
        
        ${chatContext}
        
        Here is the text content from a PDF document:
        """
        ${pdfText}
        """
        
        User question: ${userQuestion}
        
        Provide a relevant, accurate, and comprehensive response based on the PDF content. If the answer cannot be determined from the PDF content, clearly state that. 
        Make sure your response is well-structured and easy to understand. Include specific information from the document when relevant.
      `;
    }

    console.log(`Processing question: "${userQuestion}"`);
    console.log(`Skip extraction mode: ${skipExtraction}`);

    // Call Gemini API with optimized parameters
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
          maxOutputTokens: 1500,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error response:', data);
      throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
    }

    // Extract the response text
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                        "Sorry, I couldn't generate a response based on the PDF content.";

    console.log(`Generated response of ${generatedText.length} characters`);

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
