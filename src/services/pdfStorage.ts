
import { PDF } from '@/components/PDFCard';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export interface UploadedPDF extends PDF {
  dataUrl: string;
  chatMessages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const PDF_STORAGE_KEY = 'pdf_storage';
const MAX_PDF_COUNT = 50; // Maximum number of PDFs to store

// Get all saved PDFs
export const getSavedPDFs = (): UploadedPDF[] => {
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

// Save a PDF to localStorage with improved storage management
export const savePDF = (pdf: UploadedPDF): UploadedPDF => {
  try {
    if (!pdf.dataUrl) {
      console.error('Attempted to save PDF without dataUrl:', pdf);
      throw new Error('PDF must have a dataUrl to be saved');
    }
    
    const savedPDFs = getSavedPDFs();
    
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
    console.error('Error saving PDF:', error);
    toast.error('Failed to save PDF');
    return pdf;
  }
};

// Get a specific PDF by ID
export const getPDFById = (id: string): UploadedPDF | null => {
  const savedPDFs = getSavedPDFs();
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
export const addChatMessageToPDF = (pdfId: string, message: Omit<ChatMessage, 'id'>): ChatMessage | null => {
  const pdf = getPDFById(pdfId);
  if (!pdf) return null;
  
  const newMessage = {
    ...message,
    id: uuidv4()
  };
  
  const updatedMessages = [...(pdf.chatMessages || []), newMessage];
  
  savePDF({
    ...pdf,
    chatMessages: updatedMessages
  });
  
  return newMessage;
};

// Delete a PDF by ID
export const deletePDFById = (id: string): boolean => {
  try {
    const savedPDFs = getSavedPDFs();
    const filteredPDFs = savedPDFs.filter(pdf => pdf.id !== id);
    
    if (filteredPDFs.length === savedPDFs.length) {
      // PDF not found
      return false;
    }
    
    localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(filteredPDFs));
    toast.success('PDF deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting PDF:', error);
    toast.error('Failed to delete PDF');
    return false;
  }
};

// Create a PDF from a file
export const createPDFFromFile = (file: File, dataUrl: string): UploadedPDF => {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0];
  
  // Generate a thumbnail for the PDF (first page preview)
  // This would normally use PDF.js to render the first page
  // For simplicity, we'll use a placeholder or the actual dataUrl
  
  const newPDF: UploadedPDF = {
    id: uuidv4(),
    title: file.name,
    summary: `Uploaded on ${formattedDate}`,
    uploadDate: formattedDate,
    pageCount: 0, // Will be updated when loaded in the viewer
    fileSize: formatFileSize(file.size),
    dataUrl: dataUrl,
    chatMessages: []
  };
  
  return savePDF(newPDF);
};

// Format file size
export const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / 1048576).toFixed(2)} MB`;
};
