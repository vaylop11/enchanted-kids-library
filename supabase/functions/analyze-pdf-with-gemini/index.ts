import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Gemini } from "https://esm.sh/@google/generative-ai";

// Set up CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Get API key from environment variable
const apiKey = Deno.env.get("GEMINI_API_KEY");

if (!apiKey) {
  console.error("GEMINI_API_KEY environment variable not set");
}

// Handle the request
serve(async (req) => {
  // Handle OPTIONS for CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, query, previousResponses = [], responseLanguage = 'en' } = await req.json();

    if (!text || !query) {
      return new Response(
        JSON.stringify({ error: 'Missing text or query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine if we should format the response as markdown
    const useMarkdown = true; // Always use markdown formatting for better structured responses

    // Check if we should format the response in the detected language
    const formattingPrompt = generateFormattingPrompt(responseLanguage);

    const model = new Gemini(apiKey);

    // Build context from previous AI responses
    const conversationContext = previousResponses.length 
      ? "\n\nHere are some previous questions and responses from our conversation that may provide context:\n" + 
        previousResponses.map((resp, i) => `Response ${i+1}: ${resp}`).join('\n\n')
      : "";

    // Construct the prompt with the text, query, and instructions
    const promptText = `You are an advanced document analysis assistant that provides informative and accurate responses based on document content.

    DOCUMENT CONTENT:
    """
    ${text}
    """
    
    ${conversationContext}
    
    USER QUERY:
    """
    ${query}
    """
    
    ${formattingPrompt}
    
    IMPORTANT INSTRUCTIONS:
    1. Answer ONLY based on the document content.
    2. If the answer isn't in the document, say "I don't see information about that in the document."
    3. Be concise yet thorough.
    4. Format your response using markdown for better readability:
       - Use **bold** for section headers and key concepts
       - Use bullet points for lists
       - Break long paragraphs into shorter ones
       - Use proper headings where appropriate
    5. Respond in the same language as the user query (${responseLanguage}).
    6. If providing page numbers, note they are approximate.`;

    const response = await model.post({
      model: "models/gemini-pro-latest", // Using latest pro model for highest quality
      messages: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ],
      temperature: 0.2,
      topP: 0.95,
      topK: 40,
    });

    if (!response.candidates || !response.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const responseText = response.candidates[0].content.parts[0].text;

    return new Response(
      JSON.stringify({ response: responseText }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to generate formatting instructions based on language
function generateFormattingPrompt(language: string): string {
  // Adapt the formatting instructions based on detected language
  switch (language) {
    case 'ar':
      return `قم بتنسيق إجابتك بشكل احترافي:
      - استخدم **الخط العريض** للعناوين والمفاهيم الرئيسية
      - قسم الفقرات الطويلة إلى فقرات أقصر
      - استخدم النقاط للقوائم
      - حافظ على لغة واضحة ومهنية`;
    case 'fr':
      return `Formatez votre réponse de manière professionnelle:
      - Utilisez le **gras** pour les titres et concepts clés
      - Divisez les longs paragraphes en paragraphes plus courts
      - Utilisez des puces pour les listes
      - Maintenez un langage clair et professionnel`;
    case 'es':
      return `Da formato a tu respuesta de manera profesional:
      - Usa **negrita** para títulos y conceptos clave
      - Divide los párrafos largos en párrafos más cortos
      - Usa viñetas para las listas
      - Mantén un lenguaje claro y profesional`;
    case 'zh':
      return `请专业地格式化您的回答:
      - 使用**粗体**表示标题和关键概念
      - 将长段落分成更短的段落
      - 使用项目符号列表
      - 保持清晰和专业的语言`;
    default:
      return `Format your response professionally:
      - Use **bold** for headings and key concepts
      - Break long paragraphs into shorter ones
      - Use bullet points for lists
      - Maintain clear, professional language`;
  }
}
