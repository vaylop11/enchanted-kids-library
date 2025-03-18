
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

// Gemini API configuration
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-2:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface ChatRequest {
  pdfId: string;
  prompt: string;
  pdfContent?: string;
}

interface ChatResponse {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export const generateChatResponse = async ({ pdfId, prompt, pdfContent }: ChatRequest): Promise<ChatResponse | null> => {
  try {
    if (!GEMINI_API_KEY) {
      console.error('Gemini API key is not configured');
      toast.error('AI service is not properly configured');
      return null;
    }

    // Create the user message in the database
    const userMessageId = uuidv4();
    const userMessage: ChatResponse = {
      id: userMessageId,
      content: prompt,
      isUser: true,
      timestamp: new Date(),
    };

    // Save user message to Supabase
    await supabase.from('chat_messages').insert({
      id: userMessageId,
      pdf_document_id: pdfId,
      content: prompt,
      is_user: true
    });

    // Build context for AI with PDF content
    const contextPrompt = pdfContent 
      ? `The following is content from a PDF document: "${pdfContent}". 
         Now, respond to this question about the PDF: ${prompt}`
      : `Respond to this question about the PDF: ${prompt}`;

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: contextPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      toast.error('Error generating response from AI');
      return null;
    }

    const data = await response.json();
    
    // Extract the AI response text
    const aiResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I couldn\'t generate a response.';
    
    // Create AI message
    const aiMessageId = uuidv4();
    const aiMessage: ChatResponse = {
      id: aiMessageId,
      content: aiResponseText,
      isUser: false,
      timestamp: new Date(),
    };

    // Save AI message to Supabase
    await supabase.from('chat_messages').insert({
      id: aiMessageId,
      pdf_document_id: pdfId,
      content: aiResponseText,
      is_user: false
    });

    return aiMessage;
  } catch (error) {
    console.error('Error in Gemini chat service:', error);
    toast.error('Failed to generate AI response');
    return null;
  }
};

export const getChatHistory = async (pdfId: string): Promise<ChatResponse[]> => {
  try {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('pdf_document_id', pdfId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat history:', error);
      toast.error('Failed to load chat history');
      return [];
    }

    return data.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.is_user,
      timestamp: new Date(msg.created_at)
    }));
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
};
