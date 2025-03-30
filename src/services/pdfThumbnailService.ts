
import * as pdfjs from 'pdfjs-dist';
import { supabase } from '@/integrations/supabase/client';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Generate thumbnail from PDF
export const generatePDFThumbnail = async (pdfUrl: string): Promise<string | null> => {
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
export const uploadThumbnail = async (thumbnailDataUrl: string, userId: string, pdfId: string): Promise<string | null> => {
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
