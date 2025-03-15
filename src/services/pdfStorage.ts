
import { PDF } from '@/components/PDFCard';
import { v4 as uuidv4 } from 'uuid';

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
    return [];
  }
};

// Save a PDF to localStorage
export const savePDF = (pdf: UploadedPDF): UploadedPDF => {
  if (!pdf.dataUrl) {
    console.error('Attempted to save PDF without dataUrl:', pdf);
    throw new Error('PDF must have a dataUrl to be saved');
  }
  
  const savedPDFs = getSavedPDFs();
  
  // Check if PDF already exists
  const existingIndex = savedPDFs.findIndex(p => p.id === pdf.id);
  
  if (existingIndex >= 0) {
    // Update existing PDF
    savedPDFs[existingIndex] = pdf;
  } else {
    // Add new PDF
    savedPDFs.unshift(pdf);
  }
  
  localStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(savedPDFs));
  return pdf;
};

// Get a specific PDF by ID
export const getPDFById = (id: string): UploadedPDF | null => {
  const savedPDFs = getSavedPDFs();
  const pdf = savedPDFs.find(pdf => pdf.id === id);
  
  if (!pdf) return null;
  
  // Ensure the PDF has a dataUrl
  if (!pdf.dataUrl) {
    console.error('Retrieved PDF missing dataUrl:', pdf);
    return null;
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

// Create a PDF from a file
export const createPDFFromFile = (file: File, dataUrl: string): UploadedPDF => {
  const now = new Date();
  const formattedDate = now.toISOString().split('T')[0];
  
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
