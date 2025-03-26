
import { supabase, supabaseUntyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { formatFileSize } from './pdfStorage';

export interface SupabasePDF {
  id: string;
  title: string;
  summary: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string;
  thumbnail?: string;
  filePath: string;
  fileUrl?: string;
}

export interface SupabaseChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Upload a PDF file to Supabase Storage
export const uploadPDFToSupabase = async (file: File, userId: string): Promise<SupabasePDF | null> => {
  try {
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload PDF');
      return null;
    }
    
    // Get the public URL
    const { data: publicURLData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);
      
    const publicURL = publicURLData.publicUrl;
    
    // Create the formatted date
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    // Create a record in the pdfs table
    const { data: pdfData, error: pdfError } = await supabaseUntyped
      .from('pdf_documents')
      .insert({
        user_id: userId,
        title: file.name,
        summary: `Uploaded on ${formattedDate}`,
        storage_path: filePath,
        file_size: formatFileSize(file.size),
        upload_date: formattedDate,
        file_url: publicURL
      })
      .select('id')
      .single();
      
    if (pdfError) {
      console.error('Error creating PDF record:', pdfError);
      toast.error('Failed to save PDF metadata');
      return null;
    }
    
    // Return the PDF data
    const newPDF: SupabasePDF = {
      id: pdfData.id,
      title: file.name,
      summary: `Uploaded on ${formattedDate}`,
      uploadDate: formattedDate,
      pageCount: 0, // Will be updated when loaded in the viewer
      fileSize: formatFileSize(file.size),
      filePath: filePath,
      fileUrl: publicURL
    };
    
    return newPDF;
  } catch (error) {
    console.error('Error in uploadPDFToSupabase:', error);
    toast.error('Failed to upload PDF');
    return null;
  }
};

// Get all PDFs for a user
export const getUserPDFs = async (userId: string): Promise<SupabasePDF[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('pdf_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching PDFs:', error);
      toast.error('Failed to fetch PDFs');
      return [];
    }
    
    return data.map((pdf: any) => ({
      id: pdf.id,
      title: pdf.title || pdf.name || 'Unnamed PDF',
      summary: pdf.summary || '',
      uploadDate: new Date(pdf.upload_date || pdf.created_at).toISOString().split('T')[0],
      pageCount: pdf.page_count || 0,
      fileSize: pdf.file_size || '0 B',
      filePath: pdf.storage_path || pdf.file_path,
      thumbnail: pdf.thumbnail || pdf.thumbnail_url,
      fileUrl: pdf.file_url
    }));
  } catch (error) {
    console.error('Error in getUserPDFs:', error);
    toast.error('Failed to fetch PDFs');
    return [];
  }
};

// Get a PDF by ID
export const getPDFById = async (pdfId: string): Promise<SupabasePDF | null> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('pdf_documents')
      .select('*')
      .eq('id', pdfId)
      .maybeSingle();
      
    if (error || !data) {
      console.error('Error fetching PDF:', error);
      toast.error('Failed to fetch PDF');
      return null;
    }
    
    let fileUrl = data.file_url;
    
    // If file_url is not present but storage_path is, generate the URL
    if (!fileUrl && data.storage_path) {
      const { data: publicURLData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(data.storage_path);
      
      fileUrl = publicURLData.publicUrl;
    }
    
    return {
      id: data.id,
      title: data.title || data.name || 'Unnamed PDF',
      summary: data.summary || '',
      uploadDate: new Date(data.upload_date || data.created_at).toISOString().split('T')[0],
      pageCount: data.page_count || 0,
      fileSize: data.file_size || '0 B',
      filePath: data.storage_path || data.file_path,
      thumbnail: data.thumbnail || data.thumbnail_url,
      fileUrl: fileUrl
    };
  } catch (error) {
    console.error('Error in getPDFById:', error);
    toast.error('Failed to fetch PDF');
    return null;
  }
};

// Update PDF metadata
export const updatePDFMetadata = async (pdfId: string, updates: Partial<SupabasePDF>): Promise<boolean> => {
  try {
    const { error } = await supabaseUntyped
      .from('pdf_documents')
      .update({
        title: updates.title,
        summary: updates.summary,
        page_count: updates.pageCount,
        // Use database column naming convention
        updated_at: new Date().toISOString()
      })
      .eq('id', pdfId);
      
    if (error) {
      console.error('Error updating PDF:', error);
      toast.error('Failed to update PDF metadata');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updatePDFMetadata:', error);
    toast.error('Failed to update PDF metadata');
    return false;
  }
};

// Delete a PDF and its file
export const deletePDF = async (pdfId: string): Promise<boolean> => {
  try {
    // First get the PDF to get the file path
    const pdf = await getPDFById(pdfId);
    if (!pdf) return false;
    
    // Delete the file from storage if filePath exists
    if (pdf.filePath) {
      const { error: storageError } = await supabase.storage
        .from('pdfs')
        .remove([pdf.filePath]);
        
      if (storageError) {
        console.error('Error deleting PDF file:', storageError);
        toast.error('Failed to delete PDF file');
        return false;
      }
    }
    
    // Delete the PDF record
    const { error: recordError } = await supabaseUntyped
      .from('pdf_documents')
      .delete()
      .eq('id', pdfId);
      
    if (recordError) {
      console.error('Error deleting PDF record:', recordError);
      toast.error('Failed to delete PDF record');
      return false;
    }
    
    toast.success('PDF deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deletePDF:', error);
    toast.error('Failed to delete PDF');
    return false;
  }
};

// Add a chat message to a PDF
export const addChatMessageToPDF = async (
  pdfId: string, 
  content: string, 
  isUser: boolean
): Promise<SupabaseChatMessage | null> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('chat_messages')
      .insert({
        pdf_document_id: pdfId,
        content: content,
        is_user: isUser,
        role: isUser ? 'user' : 'assistant'
      })
      .select('id, content, is_user, created_at')
      .single();
      
    if (error) {
      console.error('Error adding chat message:', error);
      toast.error('Failed to add message');
      return null;
    }
    
    return {
      id: data.id,
      content: data.content,
      isUser: data.is_user,
      timestamp: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in addChatMessageToPDF:', error);
    toast.error('Failed to add message');
    return null;
  }
};

// Get chat messages for a PDF
export const getChatMessagesForPDF = async (pdfId: string): Promise<SupabaseChatMessage[]> => {
  try {
    const { data, error } = await supabaseUntyped
      .from('chat_messages')
      .select('*')
      .eq('pdf_document_id', pdfId)
      .order('created_at', { ascending: true });
      
    if (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to fetch chat messages');
      return [];
    }
    
    return data.map((message: any) => ({
      id: message.id,
      content: message.content,
      isUser: message.is_user,
      timestamp: new Date(message.created_at)
    }));
  } catch (error) {
    console.error('Error in getChatMessagesForPDF:', error);
    toast.error('Failed to fetch chat messages');
    return [];
  }
};
