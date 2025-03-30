
// This file re-exports from separate service files for backward compatibility
import { generatePDFThumbnail, uploadThumbnail } from './pdfThumbnailService';
import { uploadPDFToSupabase } from './pdfUploadService';
import { getUserPDFs, getPDFById, updatePDFMetadata, deletePDF } from './pdfManagementService';
import { 
  addChatMessageToPDF, 
  getChatMessagesForPDF, 
  deleteAllChatMessagesForPDF,
} from './pdfChatService';

// Re-export all types and functions for backward compatibility
export type { SupabasePDF, AnalysisStage } from './pdfTypes';
export type { SupabaseChatMessage } from './pdfChatService';
export {
  generatePDFThumbnail,
  uploadThumbnail,
  uploadPDFToSupabase,
  getUserPDFs,
  getPDFById,
  updatePDFMetadata,
  deletePDF,
  addChatMessageToPDF,
  getChatMessagesForPDF,
  deleteAllChatMessagesForPDF
};
