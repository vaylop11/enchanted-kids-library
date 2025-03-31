import { supabase } from '@/integrations/supabase/client';

export interface SupabasePDF {
  id: string;
  title: string;
  fileUrl: string;
  userId: string;
  pageCount: number;
  created_at: string;
}

export interface SupabaseChat {
  id: string;
  pdfId: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  userId: string;
}

export const getSupabasePDFById = async (pdfId: string): Promise<SupabasePDF | null> => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', pdfId)
      .single();
    
    if (error) {
      console.error('Error fetching PDF:', error);
      return null;
    }
    
    return data as SupabasePDF;
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return null;
  }
};

export const updateSupabasePDF = async (pdfId: string, updates: Partial<SupabasePDF>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pdfs')
      .update(updates)
      .eq('id', pdfId);
    
    if (error) {
      console.error('Error updating PDF:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating PDF:', error);
    return false;
  }
};

export const createSupabaseChat = async (chatData: Omit<SupabaseChat, 'id'>): Promise<SupabaseChat | null> => {
  try {
    const { data, error } = await supabase
      .from('pdf_chats')
      .insert(chatData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat message:', error);
      return null;
    }
    
    return data as SupabaseChat;
  } catch (error) {
    console.error('Error creating chat message:', error);
    return null;
  }
};

export const getSupabaseChatsByPdfId = async (pdfId: string): Promise<SupabaseChat[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_chats')
      .select('*')
      .eq('pdfId', pdfId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    return data as SupabaseChat[];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

export const deleteSupabaseChatMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pdf_chats')
      .delete()
      .eq('id', messageId);
    
    if (error) {
      console.error('Error deleting chat message:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return false;
  }
};

export const deleteAllChatMessagesForPDF = async (pdfId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pdf_chats')
      .delete()
      .eq('pdfId', pdfId);
    
    if (error) {
      console.error('Error deleting all chat messages:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting all chat messages:', error);
    return false;
  }
};

export const getUserPDFs = async (userId: string): Promise<SupabasePDF[]> => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('userId', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user PDFs:', error);
      return [];
    }
    
    return data as SupabasePDF[];
  } catch (error) {
    console.error('Error fetching user PDFs:', error);
    return [];
  }
};

export const uploadPDFToSupabase = async (file: File, userId: string, metadata: Partial<SupabasePDF>): Promise<SupabasePDF | null> => {
  try {
    const fileName = `${userId}/${Date.now()}_${file.name}`;
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('pdfs')
      .upload(fileName, file);
    
    if (fileError) {
      console.error('Error uploading file:', fileError);
      return null;
    }
    
    const { data: urlData } = await supabase
      .storage
      .from('pdfs')
      .getPublicUrl(fileName);
    
    const { data, error } = await supabase
      .from('pdfs')
      .insert({
        userId,
        title: metadata.title || file.name,
        fileUrl: urlData.publicUrl,
        pageCount: metadata.pageCount || 0,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating PDF record:', error);
      return null;
    }
    
    return data as SupabasePDF;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return null;
  }
};

export const deletePDF = async (pdfId: string): Promise<boolean> => {
  try {
    await deleteAllChatMessagesForPDF(pdfId);
    
    const { error } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', pdfId);
    
    if (error) {
      console.error('Error deleting PDF:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }
};
