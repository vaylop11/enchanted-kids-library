import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Gemini } from "https://esm.sh/gemini-ai@1.0.5";

const apiKey = Deno.env.get("API_KEY");

if (!apiKey) {
  console.error("Gemini API key is missing. Set the API_KEY environment variable.");
  Deno.exit(1);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string | null;
  isMarkdown?: boolean;
}

// Handle the translation request with language detection
export const translateText = async (
  text: string, 
  targetLanguage: string,
  enhancedFormat: boolean = false,
  detectionOnly: boolean = false
): Promise<TranslationResult> => {
  // Chunk large texts to avoid API limits
  const MAX_CHUNK_SIZE = 4000; // Adjust based on API limits
  let chunks: string[] = [];
  
  if (text.length > MAX_CHUNK_SIZE) {
    // Split by paragraph breaks first
    const paragraphs = text.split(/\n\s*\n/);
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length <= MAX_CHUNK_SIZE) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        // If a single paragraph is too long, split it further
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = '';
        }
        
        // If paragraph itself exceeds chunk size, split by sentence
        if (paragraph.length > MAX_CHUNK_SIZE) {
          const sentences = paragraph.split(/(?<=[.!?])\s+/);
          currentChunk = '';
          
          for (const sentence of sentences) {
            if ((currentChunk + sentence).length <= MAX_CHUNK_SIZE) {
              currentChunk += (currentChunk ? ' ' : '') + sentence;
            } else {
              if (currentChunk) {
                chunks.push(currentChunk);
              }
              // If a sentence is still too long, split it directly
              if (sentence.length > MAX_CHUNK_SIZE) {
                for (let i = 0; i < sentence.length; i += MAX_CHUNK_SIZE) {
                  chunks.push(sentence.substring(i, i + MAX_CHUNK_SIZE));
                }
              } else {
                currentChunk = sentence;
              }
            }
          }
          
          if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = '';
          }
        } else {
          chunks.push(paragraph);
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
  } else {
    chunks = [text];
  }

  try {
    // For detection only, just use a sample of the text
    if (detectionOnly) {
      // Use a sample of the text to detect language efficiently
      const sampleText = text.substring(0, 500);
      const model = new Gemini(apiKey);
      
      const response = await model.post({
        model: "models/gemini-1.5-pro-latest",
        messages: [
          {
            role: "user",
            parts: [
              {
                text: `Detect the language of the following text and respond with ONLY the language code (e.g. 'en', 'fr', 'ar', etc.):
                      
                "${sampleText}"
                
                Return ONLY the language code, nothing else.`
              }
            ]
          }
        ],
        temperature: 0,
        topP: 1,
        topK: 1,
      });
      
      let detectedLanguage = response.candidates[0].content.parts[0].text.trim().toLowerCase();
      
      // Clean up response if needed
      if (detectedLanguage.includes('\n')) {
        detectedLanguage = detectedLanguage.split('\n')[0];
      }
      detectedLanguage = detectedLanguage.replace(/[".,'`]/g, '').trim();
      
      return { 
        translatedText: "",
        detectedSourceLanguage: detectedLanguage,
        isMarkdown: false
      };
    }
    
    // Process each chunk
    const translatedChunks: string[] = [];
    
    for (const chunk of chunks) {
      const model = new Gemini(apiKey);
      
      let prompt = enhancedFormat 
        ? `Translate the following text from its original language to ${targetLanguage}. 
           IMPORTANT: Format the response beautifully:
           - Use markdown formatting (bold, lists, etc.)
           - Break long paragraphs into shorter ones
           - Use proper spacing for readability 
           - Highlight important concepts with bold formatting
           - Keep the same meaning and information
           - Use professional vocabulary and phrasing
           - Do not include any "Translation:" prefix or similar
           - Do not include the original text
           - Maintain the tone of the original text
           
           Text to translate:
           "${chunk}"`
        : `Translate the following text to ${targetLanguage}: "${chunk}"`;
      
      try {
        const response = await model.post({
          model: "models/gemini-1.5-pro-latest",
          messages: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ],
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
        });
        
        let translatedText = response.candidates[0].content.parts[0].text;
        
        // Clean up the response if needed
        translatedText = translatedText.replace(/^['"]|['"]$/g, '');
        translatedText = translatedText.replace(/^Translation:?\s*/i, '');
        
        translatedChunks.push(translatedText);
      } catch (error) {
        console.error(`Error translating chunk: ${error}`);
        // If a chunk fails, try with a smaller piece
        if (chunk.length > 1000) {
          const halfSize = Math.floor(chunk.length / 2);
          const firstHalf = chunk.substring(0, halfSize);
          const secondHalf = chunk.substring(halfSize);
          
          try {
            // Process first half
            const response1 = await model.post({
              model: "models/gemini-1.5-pro-latest",
              messages: [
                {
                  role: "user",
                  parts: [{ text: `Translate the following text to ${targetLanguage}: "${firstHalf}"` }]
                }
              ],
              temperature: 0.2,
            });
            
            translatedChunks.push(response1.candidates[0].content.parts[0].text.replace(/^['"]|['"]$/g, ''));
            
            // Process second half
            const response2 = await model.post({
              model: "models/gemini-1.5-pro-latest",
              messages: [
                {
                  role: "user",
                  parts: [{ text: `Translate the following text to ${targetLanguage}: "${secondHalf}"` }]
                }
              ],
              temperature: 0.2,
            });
            
            translatedChunks.push(response2.candidates[0].content.parts[0].text.replace(/^['"]|['"]$/g, ''));
          } catch (subError) {
            // If even smaller chunks fail, add an error notice
            translatedChunks.push(`[Translation error for part of the text]`);
          }
        } else {
          translatedChunks.push(`[Translation error]`);
        }
      }
    }
    
    // Join the translated chunks
    let finalTranslation = translatedChunks.join('\n\n');
    
    // Further cleanup
    finalTranslation = finalTranslation.replace(/^['"]|['"]$/g, '').trim();
    
    // Detect source language from response
    let detectedLanguage = '';
    if (chunks.length > 0) {
      try {
        const model = new Gemini(apiKey);
        const sampleText = chunks[0].substring(0, 500);
        
        const response = await model.post({
          model: "models/gemini-1.5-pro-latest",
          messages: [
            {
              role: "user",
              parts: [
                {
                  text: `Detect the language of the following text and respond with ONLY the language code (e.g. 'en', 'fr', 'ar', etc.):
                        
                  "${sampleText}"
                  
                  Return ONLY the language code, nothing else.`
                }
              ]
            }
          ],
          temperature: 0,
          topP: 1,
          topK: 1,
        });
        
        detectedLanguage = response.candidates[0].content.parts[0].text.trim().toLowerCase();
        
        // Clean up response
        if (detectedLanguage.includes('\n')) {
          detectedLanguage = detectedLanguage.split('\n')[0];
        }
        detectedLanguage = detectedLanguage.replace(/[".,'`]/g, '').trim();
      } catch (error) {
        console.error('Error detecting language:', error);
      }
    }
    
    return {
      translatedText: finalTranslation,
      detectedSourceLanguage: detectedLanguage,
      isMarkdown: enhancedFormat || finalTranslation.includes('**') || finalTranslation.includes('#')
    };
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error(`Translation failed: ${error.message}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text, targetLanguage, enhancedFormat, detectionOnly } = await req.json();

    if (!text && !detectionOnly) {
      return new Response(JSON.stringify({ error: 'Missing text for translation' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!targetLanguage && !detectionOnly) {
      return new Response(JSON.stringify({ error: 'Missing target language for translation' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await translateText(text, targetLanguage, enhancedFormat, detectionOnly);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
