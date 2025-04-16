
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Handle large texts by splitting them if needed
    const chunkSize = 9000; // Adjust based on model constraints
    const chunks = [];
    let currentChunk = '';
    
    if (text.length > chunkSize) {
      // Simple chunking by paragraphs or sentences
      const paragraphs = text.split(/\n\n|\r\n\r\n/);
      
      for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length > chunkSize) {
          if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = paragraph + '\n\n';
          } else {
            // Handle case where a single paragraph is too long
            chunks.push(paragraph);
          }
        } else {
          currentChunk += paragraph + '\n\n';
        }
      }
      
      // Add the last chunk if it's not empty
      if (currentChunk) {
        chunks.push(currentChunk);
      }
    } else {
      chunks.push(text);
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let finalTranslatedText = '';
    
    for (const chunk of chunks) {
      const prompt = `Translate the following text to ${targetLanguage}. Format the output in markdown to preserve formatting, headings, and structure. Only respond with the translated text in markdown format, nothing else:

${chunk}`;

      try {
        const result = await model.generateContent(prompt);
        finalTranslatedText += result.response.text() + '\n\n';
      } catch (modelError) {
        console.error('Gemini API Error:', modelError.message);
        
        // If it's a rate limit error, try with smaller chunk or timeout
        if (modelError.message && modelError.message.includes('429')) {
          // Wait a second and try again with a smaller chunk if possible
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Create a smaller chunk by roughly halving it
          const sentences = chunk.split(/[.!?]\s/);
          const midpoint = Math.floor(sentences.length / 2);
          
          const firstHalf = sentences.slice(0, midpoint).join('. ') + '.';
          const secondHalf = sentences.slice(midpoint).join('. ');
          
          try {
            // Translate first half
            const prompt1 = `Translate the following text to ${targetLanguage}. Format the output in markdown to preserve formatting, headings, and structure. Only respond with the translated text in markdown format, nothing else:\n\n${firstHalf}`;
            const result1 = await model.generateContent(prompt1);
            finalTranslatedText += result1.response.text() + '\n\n';
            
            // Translate second half
            const prompt2 = `Translate the following text to ${targetLanguage}. Format the output in markdown to preserve formatting, headings, and structure. Only respond with the translated text in markdown format, nothing else:\n\n${secondHalf}`;
            const result2 = await model.generateContent(prompt2);
            finalTranslatedText += result2.response.text() + '\n\n';
            
          } catch (retryError) {
            console.error('Failed retry with smaller chunks:', retryError);
            throw modelError; // Re-throw the original error
          }
        } else {
          throw modelError;
        }
      }
    }
    
    return new Response(
      JSON.stringify({ 
        translatedText: finalTranslatedText.trim(),
        detectedSourceLanguage: null,
        isMarkdown: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in translate-text function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
