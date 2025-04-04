
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
    const { pdfText, userQuestion, previousChat } = await req.json();
    
    if (!GEMINI_API_KEY) {
      throw new Error('Missing Gemini API Key');
    }

    // Calculate text length for processing strategy
    const textLength = pdfText.length;
    console.log(`Processing PDF with text length: ${textLength} characters`);

    // Use a chunking approach for very large documents
    let processedText = pdfText;
    const maxTextLength = 30000; // Increased limit for more comprehensive analysis
    
    if (textLength > maxTextLength) {
      console.log(`PDF text exceeds ${maxTextLength} characters, using smart chunking strategy`);
      
      // Split text into chunks focused around relevant keywords from the question
      const keywords = extractKeywords(userQuestion);
      processedText = smartChunkText(pdfText, keywords, maxTextLength);
    }
    
    // Build context with optional previous chat messages
    let chatContext = "";
    if (previousChat && previousChat.length > 0) {
      // Include up to 10 recent exchanges for context (increased from 5)
      const recentMessages = previousChat.slice(-10);
      chatContext = "Previous conversation:\n" + 
        recentMessages.map(m => `${m.isUser ? "User" : "Assistant"}: ${m.content}`).join("\n") +
        "\n\n";
    }

    // Build prompt with improved instructions
    const prompt = `
      You are an AI assistant that helps users analyze PDF documents and answer questions about them.
      
      ${chatContext}
      
      Here is the text content from a PDF document:
      """
      ${processedText}
      """
      
      User question: ${userQuestion}
      
      Provide a relevant, accurate, and comprehensive response based on the PDF content. If the answer cannot be determined from the PDF content, clearly state that. 
      Make sure your response is well-structured and easy to understand. Include specific information from the document when relevant.
    `;

    console.log(`Processing question: "${userQuestion}"`);
    console.log(`Using ${processedText.length} characters of processed text`);

    // Call Gemini API with optimized parameters for comprehensive analysis
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
          temperature: 0.2, // Slightly increased for more natural responses
          topK: 40,         // Increased for more diversity
          topP: 0.95,       // Adjusted for better quality
          maxOutputTokens: 1500, // Increased for more comprehensive responses
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

/**
 * Extract potential keywords from the user question
 */
function extractKeywords(question: string): string[] {
  // Remove common words and punctuation
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'what', 'who', 'where', 'when', 'why', 'how']);
  
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Smart chunking strategy that prioritizes text relevant to the user's question
 */
function smartChunkText(text: string, keywords: string[], maxLength: number): string {
  // Split document into paragraphs
  const paragraphs = text.split(/\n\n+/);
  
  // Score paragraphs based on keyword matches
  const scoredParagraphs = paragraphs.map(para => {
    const lowerPara = para.toLowerCase();
    const score = keywords.reduce((count, keyword) => {
      const regex = new RegExp(keyword, 'gi');
      const matches = (lowerPara.match(regex) || []).length;
      return count + matches;
    }, 0);
    return { paragraph: para, score };
  });
  
  // Sort paragraphs by score (highest first)
  scoredParagraphs.sort((a, b) => b.score - a.score);
  
  // Build result with introduction, most relevant paragraphs, and conclusion if available
  let result = "";
  let currentLength = 0;
  
  // Always include the first paragraph (likely introduction)
  if (paragraphs[0]) {
    result += paragraphs[0] + "\n\n";
    currentLength += paragraphs[0].length;
  }
  
  // Add most relevant paragraphs until we approach the limit
  for (const { paragraph, score } of scoredParagraphs) {
    if (score > 0 && currentLength + paragraph.length < maxLength * 0.95) {
      result += paragraph + "\n\n";
      currentLength += paragraph.length + 2;
    }
  }
  
  // Add conclusion if space permits (likely last paragraph)
  const lastParagraph = paragraphs[paragraphs.length - 1];
  if (lastParagraph && !result.includes(lastParagraph) && currentLength + lastParagraph.length < maxLength) {
    result += lastParagraph;
  }
  
  return result.trim();
}
