
import { supabase } from '@/integrations/supabase/client';

export interface SupabasePDF {
  id: string;
  title: string;
  fileUrl: string;
  userId: string;
  pageCount: number;
  created_at: string;
  summary?: string;
  fileSize?: string;
  upload_date?: string;
  thumbnail?: string;
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
    
    if (!data) return null;
    
    // Transform database schema to our interface
    return {
      id: data.id,
      title: data.title,
      fileUrl: data.file_path,
      userId: data.user_id,
      pageCount: data.page_count || 0,
      created_at: data.created_at,
      summary: data.summary,
      fileSize: data.file_size,
      upload_date: data.upload_date,
      thumbnail: data.thumbnail
    };
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return null;
  }
};

export const updateSupabasePDF = async (pdfId: string, updates: Partial<SupabasePDF>): Promise<boolean> => {
  try {
    // Transform our interface to database schema
    const dbUpdates: any = {};
    
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.fileUrl) dbUpdates.file_path = updates.fileUrl;
    if (updates.pageCount !== undefined) dbUpdates.page_count = updates.pageCount;
    if (updates.summary) dbUpdates.summary = updates.summary;
    if (updates.fileSize) dbUpdates.file_size = updates.fileSize;
    if (updates.thumbnail) dbUpdates.thumbnail = updates.thumbnail;
    
    const { error } = await supabase
      .from('pdfs')
      .update(dbUpdates)
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
    // Transform our interface to database schema
    const dbChatData = {
      pdf_id: chatData.pdfId,
      content: chatData.content,
      is_user: chatData.isUser,
      timestamp: chatData.timestamp,
      user_id: chatData.userId
    };
    
    const { data, error } = await supabase
      .from('pdf_chats')
      .insert(dbChatData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating chat message:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform back to our interface
    return {
      id: data.id,
      pdfId: data.pdf_id,
      content: data.content,
      isUser: data.is_user,
      timestamp: new Date(data.timestamp),
      userId: data.user_id
    };
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
      .eq('pdf_id', pdfId)
      .order('timestamp', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
    
    if (!data) return [];
    
    // Transform database schema to our interface
    return data.map(chat => ({
      id: chat.id,
      pdfId: chat.pdf_id,
      content: chat.content,
      isUser: chat.is_user,
      timestamp: new Date(chat.timestamp),
      userId: chat.user_id || ''
    }));
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
      .eq('pdf_id', pdfId);
    
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user PDFs:', error);
      return [];
    }
    
    if (!data) return [];
    
    // Transform database schema to our interface
    return data.map(pdf => ({
      id: pdf.id,
      title: pdf.title,
      fileUrl: pdf.file_path,
      userId: pdf.user_id,
      pageCount: pdf.page_count || 0,
      created_at: pdf.created_at,
      summary: pdf.summary,
      fileSize: pdf.file_size,
      upload_date: pdf.upload_date,
      thumbnail: pdf.thumbnail
    }));
  } catch (error) {
    console.error('Error fetching user PDFs:', error);
    return [];
  }
};

export const uploadPDFToSupabase = async (file: File, userId: string, metadata: Partial<SupabasePDF> = {}): Promise<SupabasePDF | null> => {
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
    
    // Transform our interface to database schema
    const pdfData = {
      user_id: userId,
      title: metadata.title || file.name,
      file_path: urlData.publicUrl,
      page_count: metadata.pageCount || 0,
      file_size: file.size.toString()
    };
    
    const { data, error } = await supabase
      .from('pdfs')
      .insert(pdfData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating PDF record:', error);
      return null;
    }
    
    if (!data) return null;
    
    // Transform back to our interface
    return {
      id: data.id,
      title: data.title,
      fileUrl: data.file_path,
      userId: data.user_id,
      pageCount: data.page_count || 0,
      created_at: data.created_at,
      summary: data.summary,
      fileSize: data.file_size,
      upload_date: data.upload_date,
      thumbnail: data.thumbnail
    };
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
