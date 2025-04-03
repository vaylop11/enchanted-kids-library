
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

    // Create slug from title for internal linking
    const generateSlug = (title) => {
      return title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    };

    const titleSlug = generateSlug(blogTitle);

    // Create the prompt based on language, with added formatting and internal linking instructions
    const systemPrompt = language === 'ar' 
      ? `أنت مساعد لكتابة المدونات المتخصصة في ChatPDF وتقنيات الذكاء الاصطناعي. قم بإنشاء مقال مدونة كامل بناءً على العنوان التالي: "${blogTitle}". 
      
      يجب أن يتضمن المقال:
      1. عنوان رئيسي باستخدام # في بداية السطر
      2. مقدمة تشرح الموضوع
      3. عدة عناوين فرعية باستخدام ## و ### في بداية الأسطر
      4. فقرات تحت كل عنوان
      5. استخدام النص العريض للكلمات المهمة باستخدام **نص عريض**
      6. خاتمة تلخص النقاط الرئيسية
      7. إضافة روابط داخلية متعلقة بالمحتوى (على الأقل 3-4 روابط) باستخدام [نص الرابط](/blog/some-slug)
      
      للروابط الداخلية، استخدم صيغة [النص](/blog/${titleSlug}-related-topic) حيث يكون "related-topic" متعلقًا بموضوع الرابط.
      
      مثال: إذا ذكرت "تحليل المستندات الطويلة"، اجعل الرابط: [تحليل المستندات الطويلة](/blog/${titleSlug}-document-analysis)
      
      ملاحظات مهمة:
      - اكتب كل عنوان في سطر مستقل تمامًا
      - اترك سطرًا فارغًا قبل وبعد كل عنوان
      - اترك سطرًا فارغًا بين الفقرات
      - استخدم **نص** لجعل النص عريضًا
      - ضع روابط داخلية للمواضيع المهمة ذات الصلة
      
      اجعل المحتوى معلوماتيًا وجذابًا ومنظمًا جيدًا وصديقًا لمحركات البحث.
      تأكد من تكرار الكلمة المفتاحية الرئيسية "Gemi ChatPDF" بشكل طبيعي 4-5 مرات على الأقل خلال المقال.`
      
      : `You are a blog writing assistant specialized in ChatPDF and AI technologies. Create a complete SEO-optimized blog post based on the following title: "${blogTitle}".
      
      The post should include:
      1. A main heading using # at the start of the line
      2. An introduction that explains the topic and mentions the main keyword "Gemi ChatPDF"
      3. Several subheadings using ## and ### at the start of the lines
      4. Well-structured paragraphs under each heading
      5. Use bold text for important terms and keywords with **bold text**
      6. A conclusion that summarizes the key points
      7. Include internal links (at least 3-4 links) related to the content using [link text](/blog/some-slug)
      
      For internal links, use the format [text](/blog/${titleSlug}-related-topic) where "related-topic" is relevant to the link topic.
      
      Example: If you mention "document analysis", make the link: [document analysis](/blog/${titleSlug}-document-analysis)
      
      Important formatting notes:
      - Each heading should be on its own line
      - Leave a blank line before and after each heading
      - Leave a blank line between paragraphs
      - Use **text** to make text bold
      - Add internal links to important related topics
      - Naturally include the main keyword "Gemi ChatPDF" 4-5 times throughout the article
      
      Make the content informative, engaging, well-structured, and SEO-friendly.
      Use related keywords like "AI PDF reader", "chat with documents", "PDF analysis", and "document AI" where appropriate.`;

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

    console.log('Blog post generated successfully');

    // Return the generated blog post
    return new Response(
      JSON.stringify({ generatedText, titleSlug }),
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
