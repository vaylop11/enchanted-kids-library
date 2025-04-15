
import { supabase } from '@/integrations/supabase/client';

export const getSupabasePDFById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching PDF from Supabase:', error);
    throw error;
  }
};

// Define the SupabasePDF type based on the Supabase database schema
export interface SupabasePDF {
  id: string;
  user_id: string;
  title: string;
  summary: string;
  upload_date: string;
  pageCount: number;
  page_count: number;
  fileSize: string;
  file_size: string;
  thumbnail?: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export const getUserPDFs = async (userId: string): Promise<SupabasePDF[]> => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to match the SupabasePDF interface
    const transformedData = data.map(pdf => ({
      ...pdf,
      pageCount: pdf.page_count,
      fileSize: pdf.file_size,
    }));

    return transformedData;
  } catch (error) {
    console.error('Error fetching PDFs from Supabase:', error);
    return [];
  }
};

export const uploadPDFToSupabase = async (file: File, userId: string): Promise<SupabasePDF | null> => {
  try {
    // Upload file to storage
    const fileName = `${userId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `pdfs/${fileName}`;
    
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file);

    if (storageError) throw storageError;

    // Get file URL
    const { data: urlData } = await supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);

    // Create PDF entry in database
    const pdfData = {
      user_id: userId,
      title: file.name,
      summary: `Uploaded on ${new Date().toISOString().split('T')[0]}`,
      file_path: filePath,
      file_size: formatFileSize(file.size),
      page_count: 0, // Will be updated after processing
    };

    const { data, error } = await supabase
      .from('pdfs')
      .insert(pdfData)
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      pageCount: data.page_count,
      fileSize: data.file_size,
    };
  } catch (error) {
    console.error('Error uploading PDF to Supabase:', error);
    return null;
  }
};

export const deletePDF = async (id: string): Promise<boolean> => {
  try {
    // First get the PDF to get the file path
    const { data: pdf, error: fetchError } = await supabase
      .from('pdfs')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete file from storage
    if (pdf && pdf.file_path) {
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([pdf.file_path]);

      if (storageError) {
        console.error('Error deleting PDF file from storage:', storageError);
        // Continue with deleting database entry even if storage delete fails
      }
    }

    // Delete PDF from database
    const { error: dbError } = await supabase
      .from('pdfs')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return false;
  }
};

export const getPDFById = async (id: string): Promise<SupabasePDF | null> => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (!data) return null;
    
    // Get the file URL
    const { data: urlData } = await supabase.storage
      .from('pdfs')
      .getPublicUrl(data.file_path);
    
    return {
      ...data,
      pageCount: data.page_count,
      fileSize: data.file_size,
      fileUrl: urlData.publicUrl,
    };
  } catch (error) {
    console.error('Error fetching PDF from Supabase:', error);
    return null;
  }
};

export interface PDFChatMessage {
  id: string;
  pdf_id: string;
  is_user: boolean;
  content: string;
  timestamp: string;
}

export const getChatMessagesForPDF = async (pdfId: string): Promise<PDFChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_chats')
      .select('*')
      .eq('pdf_id', pdfId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return [];
  }
};

export const addChatMessageToPDF = async (
  pdfId: string,
  content: string,
  isUser: boolean
): Promise<PDFChatMessage | null> => {
  try {
    const { data, error } = await supabase
      .from('pdf_chats')
      .insert({
        pdf_id: pdfId,
        content,
        is_user: isUser,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding chat message:', error);
    return null;
  }
};

export const updatePDFMetadata = async (
  id: string,
  metadata: Partial<SupabasePDF>
): Promise<boolean> => {
  try {
    // Convert pageCount to page_count for database
    const dbMetadata = {
      ...metadata,
      page_count: metadata.pageCount,
      file_size: metadata.fileSize,
    };
    
    // Remove fields that should not be updated directly
    delete dbMetadata.pageCount;
    delete dbMetadata.fileSize;
    delete dbMetadata.id;
    delete dbMetadata.user_id;
    delete dbMetadata.created_at;
    delete dbMetadata.fileUrl;

    const { error } = await supabase
      .from('pdfs')
      .update(dbMetadata)
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating PDF metadata:', error);
    return false;
  }
};

// Helper function to format file size
const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1048576).toFixed(2)} MB`;
};
