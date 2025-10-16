
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
// Using gemini-2.5-flash for better performance and quality
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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
    // Parse request body and validate inputs
    let body;
    try {
      body = await req.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { pdfText, userQuestion, previousChat } = body;
    
    if (!pdfText || !userQuestion) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: pdfText and userQuestion' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!GEMINI_API_KEY) {
      console.error('Missing Gemini API Key');
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate text length for processing strategy
    const textLength = pdfText.length;
    console.log(`Processing PDF with text length: ${textLength} characters`);

    // Use a chunking approach for very large documents (increased to 100,000)
    let processedText = pdfText;
    const maxTextLength = 100000; // Significantly increased for comprehensive analysis
    
    if (textLength > maxTextLength) {
      console.log(`PDF text exceeds ${maxTextLength} characters, using smart chunking strategy`);
      
      // Split text into chunks focused around relevant keywords from the question
      const keywords = extractKeywords(userQuestion);
      processedText = smartChunkText(pdfText, keywords, maxTextLength);
    }
    
    // Build context with optional previous chat messages (full history)
    let chatContext = "";
    if (previousChat && previousChat.length > 0) {
      // Include full conversation history for better context
      chatContext = "Previous conversation:\n" + 
        previousChat.map(m => `${m.isUser ? "User" : "Assistant"}: ${m.content}`).join("\n") +
        "\n\n";
    }

    // Enhanced system prompt with better instructions for Arabic and English
    const prompt = `You are an expert AI assistant specializing in document analysis and comprehension. 

Your capabilities:
- Deep understanding of document content and context
- Accurate citation with section references when available
- Bilingual support (Arabic and English)
- Clear, well-structured responses with formatting
- Ability to explain complex concepts in simple terms

Response guidelines:
1. Always provide accurate, relevant answers based strictly on the document content
2. If information is not in the document, clearly state this fact
3. For Arabic queries (العربية), respond in formal Arabic (الفصحى) with proper structure
4. For English queries, use clear, professional language
5. Use markdown formatting for better readability:
   - Use **bold** for key points
   - Use bullet points for lists
   - Use numbered lists for steps or sequences
6. Break down complex answers into digestible sections
7. When referencing document content, be specific
8. If asked to summarize, provide comprehensive yet concise summaries
9. Always maintain context from previous conversation

${chatContext}

Document content:
"""
${processedText}
"""

User question: ${userQuestion}

Provide your response:`;

    console.log(`Processing question: "${userQuestion}"`);
    console.log(`Using ${processedText.length} characters of processed text`);

    // Make the API call with better error handling
    try {
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
            temperature: 0.3,      // Balanced for accuracy and natural responses
            topK: 50,              // More diversity in token selection
            topP: 0.95,            // High quality responses
            maxOutputTokens: 2048, // Significantly increased for comprehensive answers
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error response:', errorData);
        return new Response(
          JSON.stringify({ error: `Gemini API error: ${response.status} - ${errorData}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const data = await response.json();
      
      // Extract the response text with proper validation
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 
                          "Sorry, I couldn't generate a response based on the PDF content.";

      console.log(`Generated response of ${generatedText.length} characters`);

      return new Response(
        JSON.stringify({ response: generatedText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);
      return new Response(
        JSON.stringify({ error: `Failed to call Gemini API: ${apiError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in analyze-pdf-with-gemini function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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
