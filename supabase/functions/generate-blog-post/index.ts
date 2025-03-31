
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    // Get request body
    const { blogTitle, language = 'en' } = await req.json();
    
    if (!blogTitle) {
      return new Response(
        JSON.stringify({ error: 'Blog title is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating blog post for title: "${blogTitle}" in language: ${language}`);

    // Create the prompt based on language, with added formatting instructions
    const systemPrompt = language === 'ar' 
      ? `أنت مساعد لكتابة المدونات المتخصصة في ChatPDF وتقنيات الذكاء الاصطناعي. قم بإنشاء مقال مدونة كامل بناءً على العنوان التالي: "${blogTitle}". 
      
      يجب أن يتضمن المقال:
      1. عنوان رئيسي باستخدام # في بداية السطر
      2. مقدمة تشرح الموضوع
      3. عدة عناوين فرعية باستخدام ## و ### في بداية الأسطر
      4. فقرات تحت كل عنوان
      5. فقرة تسمى [Image: وصف الصورة] حيث سيتم إضافة صورة
      6. خاتمة تلخص النقاط الرئيسية
      
      اجعل المحتوى معلوماتيًا وجذابًا ومنظمًا جيدًا.`
      
      : `You are a blog writing assistant specialized in ChatPDF and AI technologies. Create a complete blog post based on the following title: "${blogTitle}".
      
      The post should include:
      1. A main heading using # at the start of the line
      2. An introduction that explains the topic
      3. Several subheadings using ## and ### at the start of the lines
      4. Paragraphs under each heading
      5. A paragraph called [Image: description of image] where an image will be inserted
      6. A conclusion that summarizes the key points
      
      Make the content informative, engaging, and well-structured.`;

    // Call Gemini API
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!generatedText) {
      throw new Error('Failed to generate blog content');
    }

    // Return the generated blog post
    return new Response(
      JSON.stringify({ generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-blog-post function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
