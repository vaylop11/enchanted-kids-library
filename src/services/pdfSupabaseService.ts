import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { formatFileSize } from './pdfStorage';
import * as pdfjs from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

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

// Generate thumbnail from PDF
const generatePDFThumbnail = async (pdfUrl: string): Promise<string | null> => {
  try {
    console.log('Generating thumbnail for PDF:', pdfUrl);
    
    // Load the PDF document
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    
    // Get the first page
    const page = await pdf.getPage(1);
    
    // Set the scale for the thumbnail (adjust as needed)
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Prepare canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Canvas context could not be created');
      return null;
    }
    
    // Set canvas dimensions to match the viewport
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render the page to the canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;
    
    // Convert canvas to data URL (JPEG with medium quality for better storage)
    const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.5);
    
    console.log('Thumbnail generated successfully');
    
    return thumbnailDataUrl;
  } catch (error) {
    console.error('Error generating PDF thumbnail:', error);
    return null;
  }
};

// Upload a thumbnail to Supabase Storage
const uploadThumbnail = async (thumbnailDataUrl: string, userId: string, pdfId: string): Promise<string | null> => {
  try {
    // Convert data URL to blob
    const response = await fetch(thumbnailDataUrl);
    const blob = await response.blob();
    
    // Create a unique file path for the thumbnail
    const filePath = `${userId}/${pdfId}/thumbnail.jpg`;
    
    // Upload the thumbnail to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading thumbnail:', uploadError);
      return null;
    }
    
    // Get the public URL for the uploaded thumbnail
    const { data: publicURLData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);
      
    return publicURLData.publicUrl;
  } catch (error) {
    console.error('Error in uploadThumbnail:', error);
    return null;
  }
};

// Upload a PDF file to Supabase Storage
export const uploadPDFToSupabase = async (file: File, userId: string): Promise<SupabasePDF | null> => {
  try {
    console.log('Starting PDF upload for user:', userId);
    
    // Create a unique file path
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    console.log('Uploading file to path:', filePath);
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(filePath, file);
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      toast.error('Failed to upload PDF');
      return null;
    }
    
    console.log('File uploaded successfully, getting public URL');
    
    // Get the public URL
    const { data: publicURLData } = supabase.storage
      .from('pdfs')
      .getPublicUrl(filePath);
      
    const publicURL = publicURLData.publicUrl;
    
    // Generate a thumbnail for the PDF
    console.log('Generating thumbnail from PDF');
    const thumbnailDataUrl = await generatePDFThumbnail(publicURL);
    let thumbnailUrl = null;
    
    // Create the formatted date
    const now = new Date();
    const formattedDate = now.toISOString().split('T')[0];
    
    // Create PDF record data
    const pdfData: any = {
      user_id: userId,
      title: file.name,
      summary: `Uploaded on ${formattedDate}`,
      file_path: filePath,
      file_size: formatFileSize(file.size),
      upload_date: formattedDate,
      page_count: 0 // Will be updated when loaded in the viewer
    };
    
    // Insert PDF record to get the ID
    console.log('Creating PDF record in database');
    const { data: newPdfRecord, error: pdfError } = await supabase
      .from('pdfs')
      .insert(pdfData)
      .select('id')
      .single();
      
    if (pdfError) {
      console.error('Error creating PDF record:', pdfError);
      
      // Check for specific error cases
      if (pdfError.message.includes('violates foreign key constraint')) {
        toast.error('Failed to associate PDF with your account. Please sign in again.');
      } else if (pdfError.message.includes('duplicate key value')) {
        toast.error('A PDF with this name already exists. Please rename the file.');
      } else {
        toast.error('Failed to save PDF metadata');
      }
      
      // Try to delete the uploaded file to avoid orphaned files
      try {
        await supabase.storage.from('pdfs').remove([filePath]);
        console.log('Deleted orphaned file after metadata error');
      } catch (deleteError) {
        console.error('Failed to delete orphaned file:', deleteError);
      }
      
      return null;
    }
    
    console.log('PDF record created with ID:', newPdfRecord.id);
    
    // If we have a thumbnail, upload it
    if (thumbnailDataUrl) {
      thumbnailUrl = await uploadThumbnail(thumbnailDataUrl, userId, newPdfRecord.id);
      
      if (thumbnailUrl) {
        console.log('Updating PDF record with thumbnail URL');
        // Update the PDF record with the thumbnail URL
        await supabase
          .from('pdfs')
          .update({ thumbnail: thumbnailUrl })
          .eq('id', newPdfRecord.id);
      }
    }
    
    // Return the PDF data
    const newPDF: SupabasePDF = {
      id: newPdfRecord.id,
      title: file.name,
      summary: `Uploaded on ${formattedDate}`,
      uploadDate: formattedDate,
      pageCount: 0, // Will be updated when loaded in the viewer
      fileSize: formatFileSize(file.size),
      filePath: filePath,
      fileUrl: publicURL,
      thumbnail: thumbnailUrl || undefined
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

// Add a chat message to a PDF
export const addChatMessageToPDF = async (
  pdfId: string, 
  content: string, 
  isUser: boolean
): Promise<SupabaseChatMessage | null> => {
  try {
    const messageData = {
      pdf_id: pdfId,
      content: content,
      is_user: isUser
    };
    
    const { data, error } = await supabase
      .from('pdf_chats')
      .insert(messageData)
      .select('id, content, is_user, timestamp')
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
      timestamp: new Date(data.timestamp)
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
    const { data, error } = await supabase
      .from('pdf_chats')
      .select('*')
      .eq('pdf_id', pdfId)
      .order('timestamp', { ascending: true });
      
    if (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to fetch chat messages');
      return [];
    }
    
    return data.map((message: any) => ({
      id: message.id,
      content: message.content,
      isUser: message.is_user,
      timestamp: new Date(message.timestamp)
    }));
  } catch (error) {
    console.error('Error in getChatMessagesForPDF:', error);
    toast.error('Failed to fetch chat messages');
    return [];
  }
};
