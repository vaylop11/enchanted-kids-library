
import { supabase } from '@/integrations/supabase/client';

// Base PDF interface with common properties
export interface BasePDF {
  id: string;
  title: string;
  summary: string;
  pageCount: number;
  fileSize: string;
  thumbnail?: string;
}

// Frontend PDF interface
export interface PDF extends BasePDF {
  uploadDate: string;
}

// Supabase PDF interface
export interface SupabasePDF extends BasePDF {
  user_id: string;
  file_path: string;
  upload_date: string;
  page_count: number;
  file_size: string;
  created_at: string;
  updated_at: string;
  fileUrl?: string;
  // Add uploadDate as optional for compatibility with PDF interface
  uploadDate?: string;
}

export interface PDFChatMessage {
  id: string;
  pdf_id: string;
  is_user: boolean;
  content: string;
  timestamp: string;
  isUser?: boolean;
}

export const getSupabasePDFById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    
    if (data) {
      // Get file URL
      const { data: urlData } = await supabase.storage
        .from('pdfs')
        .getPublicUrl(data.file_path);
        
      return {
        ...data,
        fileUrl: urlData.publicUrl,
        pageCount: data.page_count,
        fileSize: data.file_size,
        uploadDate: data.upload_date
      } as SupabasePDF;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching PDF from Supabase:', error);
    throw error;
  }
};

export const getUserPDFs = async (userId: string): Promise<SupabasePDF[]> => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Transform data to match the SupabasePDF interface with additional compatibility properties
    const transformedData = data.map(pdf => {
      // Get file URL for each PDF
      const { data: urlData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(pdf.file_path);
        
      return {
        ...pdf,
        pageCount: pdf.page_count,
        fileSize: pdf.file_size,
        uploadDate: pdf.upload_date,
        fileUrl: urlData.publicUrl
      };
    });

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
      uploadDate: data.upload_date,
      fileUrl: urlData.publicUrl
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
      uploadDate: data.upload_date,
      fileUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error fetching PDF from Supabase:', error);
    return null;
  }
};

export const getChatMessagesForPDF = async (pdfId: string): Promise<PDFChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_chats')
      .select('*')
      .eq('pdf_id', pdfId)
      .order('timestamp', { ascending: true });

    if (error) throw error;
    
    // Add isUser property for compatibility
    return data ? data.map(msg => ({
      ...msg,
      isUser: msg.is_user
    })) : [];
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
    
    // Add isUser property for compatibility
    return data ? {
      ...data,
      isUser: data.is_user
    } : null;
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
    const dbMetadata: any = { ...metadata };
    
    if (metadata.pageCount !== undefined) {
      dbMetadata.page_count = metadata.pageCount;
      delete dbMetadata.pageCount;
    }
    
    if (metadata.fileSize !== undefined) {
      dbMetadata.file_size = metadata.fileSize;
      delete dbMetadata.fileSize;
    }
    
    // Remove fields that should not be updated directly
    delete dbMetadata.id;
    delete dbMetadata.user_id;
    delete dbMetadata.created_at;
    delete dbMetadata.fileUrl;
    delete dbMetadata.uploadDate;

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
