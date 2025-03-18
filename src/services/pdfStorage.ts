import { PDF } from '@/components/PDFCard';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { supabase, getStorageUrl, createGoogleDocsViewerUrl } from '@/integrations/supabase/client';

export interface UploadedPDF extends PDF {
  dataUrl: string;
  chatMessages?: ChatMessage[];
  storageUrl?: string;
  googleViewerUrl?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const PDF_STORAGE_KEY = 'pdf_storage';
const MAX_PDF_COUNT = 50; // Maximum number of PDFs to store

// Get all saved PDFs - combines local and Supabase PDFs
export const getSavedPDFs = async (): Promise<UploadedPDF[]> => {
  try {
    // Try to get PDFs from Supabase first
    const { data: supabasePDFs, error } = await supabase
      .from('pdf_documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching PDFs from Supabase:', error);
      // Fallback to local storage if there's an error or user is not authenticated
      return getLocalPDFs();
    }
    
    if (supabasePDFs && supabasePDFs.length > 0) {
      // Map Supabase PDFs to our format
      return supabasePDFs.map(pdf => ({
        id: pdf.id,
        title: pdf.title || 'Untitled PDF',
        summary: pdf.summary || `Uploaded on ${new Date(pdf.created_at).toLocaleDateString()}`,
        uploadDate: new Date(pdf.created_at).toISOString().split('T')[0],
        pageCount: pdf.page_count || 0,
        fileSize: pdf.file_size || '0 KB',
        dataUrl: pdf.storage_path ? getStorageUrl(pdf.storage_path) : '',
        storageUrl: pdf.storage_path ? getStorageUrl(pdf.storage_path) : '',
        googleViewerUrl: pdf.storage_path ? createGoogleDocsViewerUrl(getStorageUrl(pdf.storage_path)) : '',
        thumbnail: pdf.thumbnail_url || undefined
      }));
    } else {
      // Fallback to local storage if no PDFs in Supabase
      return getLocalPDFs();
    }
  } catch (error) {
    console.error('Error in getSavedPDFs:', error);
    // Fallback to local storage
    return getLocalPDFs();
  }
};

// Get PDFs from local storage only
const getLocalPDFs = (): UploadedPDF[] => {
  const storedData = localStorage.getItem(PDF_STORAGE_KEY);
  if (!storedData) return [];
  
  try {
    const pdfs = JSON.parse(storedData) as UploadedPDF[];
    
    // Convert timestamp strings back to Date objects
    return pdfs.map(pdf => ({
      ...pdf,
      chatMessages: pdf.chatMessages?.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error parsing saved PDFs:', error);
    toast.error('Failed to load your saved PDFs. Storage might be corrupted.');
    return [];
  }
};

// Upload a PDF to Supabase storage and save metadata
export const savePDF = async (pdf: UploadedPDF): Promise<UploadedPDF> => {
  try {
    // Check if PDF has data
    if (!pdf.dataUrl) {
      console.error('Attempted to save PDF without dataUrl:', pdf);
      throw new Error('PDF must have a dataUrl to be saved');
    }
    
    // Try to upload to Supabase if it's a new PDF
    const existingPDF = await getPDFById(pdf.id);
    
    if (!existingPDF) {
      // It's a new PDF, upload to Supabase
      const storagePath = `pdfs/${pdf.id}/${pdf.title.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // First, convert the dataUrl to a Blob if it's a data URL
      let fileBlob;
      if (pdf.dataUrl.startsWith('data:')) {
        // Convert data URL to Blob
        const res = await fetch(pdf.dataUrl);
        fileBlob = await res.blob();
      } else {
        // It's already a URL, fetch it and get the blob
        const res = await fetch(pdf.dataUrl);
        fileBlob = await res.blob();
      }
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(storagePath, fileBlob, {
          contentType: 'application/pdf',
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading PDF to Supabase storage:', uploadError);
        // Fallback to local storage
        return saveToLocalStorage(pdf);
      }
      
      // Get the public URL
      const storageUrl = getStorageUrl(`pdfs/${storagePath}`);
      const googleViewerUrl = createGoogleDocsViewerUrl(storageUrl);
      
      // Create PDF document record in database
      const { data: insertedPdf, error: insertError } = await supabase
        .from('pdf_documents')
        .insert({
          id: pdf.id,
          title: pdf.title,
          summary: pdf.summary,
          page_count: pdf.pageCount,
          file_size: pdf.fileSize,
          storage_path: storagePath,
          preview_url: googleViewerUrl,
          thumbnail_url: pdf.thumbnail
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error inserting PDF metadata into Supabase:', insertError);
        // Fallback to local storage
        return saveToLocalStorage(pdf);
      }
      
      // Return the PDF with Supabase storage URLs
      return {
        ...pdf,
        storageUrl,
        googleViewerUrl
      };
    }
    
    // It's an existing PDF, just update the metadata
    const { error: updateError } = await supabase
      .from('pdf_documents')
      .update({
        title: pdf.title,
        summary: pdf.summary,
        page_count: pdf.pageCount
      })
      .eq('id', pdf.id);
    
    if (updateError) {
      console.error('Error updating PDF in Supabase:', updateError);
      // Fallback to local storage
      return saveToLocalStorage(pdf);
    }
    
    return pdf;
  } catch (error) {
    console.error('Error in savePDF:', error);
    // Fallback to local storage
    return saveToLocalStorage(pdf);
  }
};

// Fallback function to save to local storage when Supabase fails
const saveToLocalStorage = (pdf: UploadedPDF): UploadedPDF => {
  try {
    const savedPDFs = getLocalPDFs();
    
    // Check if PDF already exists
    const existingIndex = savedPDFs.findIndex(p => p.id === pdf.id);
    
    let pdfsToSave = [...savedPDFs];
    
    if (existingIndex >= 0) {
      // Update existing PDF
      pdfsToSave[existingIndex] = pdf;
    } else {
      // Add new PDF at the beginning (newest first)
      pdfsToSave.unshift(pdf);
      
      // If we exceed the max count, remove oldest PDFs
      if (pdfsToSave.length > MAX_PDF_COUNT) {
        pdfsToSave = pdfsToSave.slice(0, MAX_PDF_COUNT);
        toast.info(`You've reached the maximum storage limit. Oldest PDFs have been removed.`);
      }
    }
    
    // Try to save data
    try {
      localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(pdfsToSave));
    } catch (storageError) {
      console.warn('Storage quota exceeded, pruning data:', storageError);
      
      // If we hit storage limits, remove the oldest PDFs until it fits
      let removed = false;
      
      while (pdfsToSave.length > 1) {
        // Remove the oldest PDF (last in the array)
        pdfsToSave.pop();
        removed = true;
        
        try {
          localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(pdfsToSave));
          console.log(`Successfully saved after removing ${removed ? 'old PDFs' : 'nothing'}`);
          toast.warning('Some older PDFs were removed due to storage limitations');
          break; // Successfully saved
        } catch (e) {
          // Still can't save, continue removing
          console.log('Still cannot save, removing more PDFs');
        }
      }
      
      // If we still can't save, try saving without the data URL as a last resort
      if (pdfsToSave.length === 1 && pdfsToSave[0].id === pdf.id) {
        try {
          // Try to save just metadata without the large dataUrl
          const compressedPdf = { ...pdf };
          delete compressedPdf.dataUrl; // Remove the large dataUrl property
          compressedPdf.dataUrl = ''; // Set empty string instead
          pdfsToSave = [compressedPdf];
          localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(pdfsToSave));
          console.warn('Saved PDF without dataUrl due to storage limitations');
          toast.error('PDF data couldn\'t be stored due to browser storage limitations');
          
          // Return the original PDF for this session, even though we couldn't save it fully
          return pdf;
        } catch (e) {
          console.error('Unable to save PDF due to storage limitations, even without dataUrl');
          toast.error('Unable to save PDF due to browser storage limitations');
        }
      }
    }
    
    return pdf;
  } catch (error) {
    console.error('Error saving PDF to local storage:', error);
    toast.error('Failed to save PDF');
    return pdf;
  }
};

// Get a specific PDF by ID
export const getPDFById = async (id: string): Promise<UploadedPDF | null> => {
  try {
    // Try to get from Supabase first
    const { data: pdfData, error } = await supabase
      .from('pdf_documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching PDF from Supabase:', error);
      // Fallback to local storage
      return getLocalPDFById(id);
    }
    
    if (pdfData) {
      // Generate URLs
      const storageUrl = pdfData.storage_path ? getStorageUrl(`pdfs/${pdfData.storage_path}`) : '';
      const googleViewerUrl = storageUrl ? createGoogleDocsViewerUrl(storageUrl) : '';
      
      // Return the PDF
      return {
        id: pdfData.id,
        title: pdfData.title || 'Untitled PDF',
        summary: pdfData.summary || `Uploaded on ${new Date(pdfData.created_at).toLocaleDateString()}`,
        uploadDate: new Date(pdfData.created_at).toISOString().split('T')[0],
        pageCount: pdfData.page_count || 0,
        fileSize: pdfData.file_size || '0 KB',
        dataUrl: storageUrl,
        storageUrl,
        googleViewerUrl,
        thumbnail: pdfData.thumbnail_url || undefined
      };
    }
    
    // Fallback to local storage
    return getLocalPDFById(id);
  } catch (error) {
    console.error('Error in getPDFById:', error);
    // Fallback to local storage
    return getLocalPDFById(id);
  }
};

// Get a PDF from local storage
const getLocalPDFById = (id: string): UploadedPDF | null => {
  const savedPDFs = getLocalPDFs();
  const pdf = savedPDFs.find(pdf => pdf.id === id);
  
  if (!pdf) return null;
  
  // Check if the PDF has valid data
  if (!pdf.dataUrl) {
    console.error('Retrieved PDF missing dataUrl:', pdf);
    toast.error('PDF data is missing. It may have been partially saved due to storage limitations.');
  }
  
  return pdf;
};

// Add a chat message to a PDF
export const addChatMessageToPDF = async (pdfId: string, message: Omit<ChatMessage, 'id'>): Promise<ChatMessage | null> => {
  try {
    const newMessage = {
      ...message,
      id: uuidv4()
    };
    
    // Try to save to Supabase first
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        id: newMessage.id,
        pdf_document_id: pdfId,
        content: newMessage.content,
        is_user: newMessage.isUser
      });
    
    if (error) {
      console.error('Error saving chat message to Supabase:', error);
      // Fallback to local storage
      return addChatMessageToLocalPDF(pdfId, message);
    }
    
    return newMessage;
  } catch (error) {
    console.error('Error in addChatMessageToPDF:', error);
    // Fallback to local storage
    return addChatMessageToLocalPDF(pdfId, message);
  }
};

// Add a chat message to a PDF in local storage
const addChatMessageToLocalPDF = (pdfId: string, message: Omit<ChatMessage, 'id'>): ChatMessage | null => {
  const pdf = getLocalPDFById(pdfId);
  if (!pdf) return null;
  
  const newMessage = {
    ...message,
    id: uuidv4()
  };
  
  const updatedMessages = [...(pdf.chatMessages || []), newMessage];
  
  saveToLocalStorage({
    ...pdf,
    chatMessages: updatedMessages
  });
  
  return newMessage;
};

// Get chat messages for a PDF
export const getChatMessagesForPDF = async (pdfId: string): Promise<ChatMessage[]> => {
  try {
    // Try to get from Supabase first
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('pdf_document_id', pdfId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching chat messages from Supabase:', error);
      // Fallback to local storage
      const pdf = getLocalPDFById(pdfId);
      return pdf?.chatMessages || [];
    }
    
    if (messages && messages.length > 0) {
      // Map Supabase messages to our format
      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at)
      }));
    }
    
    // Fallback to local storage
    const pdf = getLocalPDFById(pdfId);
    return pdf?.chatMessages || [];
  } catch (error) {
    console.error('Error in getChatMessagesForPDF:', error);
    // Fallback to local storage
    const pdf = getLocalPDFById(pdfId);
    return pdf?.chatMessages || [];
  }
};

// Delete a PDF by ID
export const deletePDFById = async (id: string): Promise<boolean> => {
  try {
    // Try to delete from Supabase first
    const { error: deletePdfError } = await supabase
      .from('pdf_documents')
      .delete()
      .eq('id', id);
    
    // Also delete from storage if possible
    const pdf = await getPDFById(id);
    if (pdf && pdf.storageUrl) {
      const storagePath = `pdfs/${id}`;
      const { error: deleteStorageError } = await supabase.storage
        .from('pdfs')
        .remove([storagePath]);
      
      if (deleteStorageError) {
        console.warn('Could not delete PDF from storage:', deleteStorageError);
      }
    }
    
    if (deletePdfError) {
      console.error('Error deleting PDF from Supabase:', deletePdfError);
      // Fallback to local storage
      return deleteLocalPDFById(id);
    }
    
    // Also remove from local storage to keep them in sync
    deleteLocalPDFById(id);
    
    toast.success('PDF deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deletePDFById:', error);
    // Fallback to local storage
    return deleteLocalPDFById(id);
  }
};

// Delete a PDF from local storage
const deleteLocalPDFById = (id: string): boolean => {
  try {
    const savedPDFs = getLocalPDFs();
    const filteredPDFs = savedPDFs.filter(pdf => pdf.id !== id);
    
    if (filteredPDFs.length === savedPDFs.length) {
      // PDF not found
      return false;
    }
    
    localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(filteredPDFs));
    return true;
  } catch (error) {
    console.error('Error deleting PDF from local storage:', error);
    toast.error('Failed to delete PDF');
    return false;
  }
};

// Create a PDF from a file
export const createPDFFromFile = async (file: File, dataUrl: string): Promise<UploadedPDF> => {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0];
  
  // Generate a unique ID
  const pdfId = uuidv4();
  
  const newPDF: UploadedPDF = {
    id: pdfId,
    title: file.name,
    summary: `Uploaded on ${formattedDate}`,
    uploadDate: formattedDate,
    pageCount: 0, // Will be updated when loaded in the viewer
    fileSize: formatFileSize(file.size),
    dataUrl: dataUrl,
    chatMessages: []
  };
  
  // First save to the database
  const savedPDF = await savePDF(newPDF);
  
  return savedPDF;
};

// Format file size
export const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1048576).toFixed(2)} MB`;
};
