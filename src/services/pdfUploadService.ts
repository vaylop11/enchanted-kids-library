
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { formatFileSize } from './pdfStorage';
import { generatePDFThumbnail, uploadThumbnail } from './pdfThumbnailService';
import { SupabasePDF } from './pdfTypes';

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
