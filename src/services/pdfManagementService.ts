
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SupabasePDF } from './pdfTypes';

// Get all PDFs for a user
export const getUserPDFs = async (userId: string): Promise<SupabasePDF[]> => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
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
      title: pdf.title,
      summary: pdf.summary || '',
      uploadDate: new Date(pdf.upload_date).toISOString().split('T')[0],
      pageCount: pdf.page_count || 0,
      fileSize: pdf.file_size || '0 B',
      filePath: pdf.file_path,
      thumbnail: pdf.thumbnail,
      // Add file URL
      fileUrl: supabase.storage.from('pdfs').getPublicUrl(pdf.file_path).data.publicUrl
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
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', pdfId)
      .single();
      
    if (error) {
      console.error('Error fetching PDF:', error);
      toast.error('Failed to fetch PDF');
      return null;
    }
    
    // Get the file URL
    const { data: publicURLData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(data.file_path);
    
    return {
      id: data.id,
      title: data.title,
      summary: data.summary || '',
      uploadDate: new Date(data.upload_date).toISOString().split('T')[0],
      pageCount: data.page_count || 0,
      fileSize: data.file_size || '0 B',
      filePath: data.file_path,
      thumbnail: data.thumbnail,
      fileUrl: publicURLData.publicUrl
    };
  } catch (error) {
    console.error('Error in getPDFById:', error);
    toast.error('Failed to fetch PDF');
    return null;
  }
};

// Get PDF function - renamed for consistency and to avoid confusion
export const getPDF = getPDFById;

// Update PDF metadata
export const updatePDFMetadata = async (pdfId: string, updates: Partial<SupabasePDF>): Promise<boolean> => {
  try {
    console.log('Updating PDF metadata for ID:', pdfId, 'with updates:', updates);
    
    const updateData: Record<string, any> = {};
    
    // Map SupabasePDF fields to database column names
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.summary !== undefined) updateData.summary = updates.summary;
    if (updates.pageCount !== undefined) updateData.page_count = updates.pageCount;
    
    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('pdfs')
      .update(updateData)
      .eq('id', pdfId);
      
    if (error) {
      console.error('Error updating PDF metadata:', error);
      toast.error('Failed to update PDF metadata');
      return false;
    }
    
    console.log('PDF metadata updated successfully');
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
    
    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('pdfs')
      .remove([pdf.filePath]);
      
    if (storageError) {
      console.error('Error deleting PDF file:', storageError);
      toast.error('Failed to delete PDF file');
      return false;
    }
    
    // Delete the PDF record
    const { error: recordError } = await supabase
      .from('pdfs')
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
