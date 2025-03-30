
// This file re-exports from separate service files for backward compatibility
import { generatePDFThumbnail, uploadThumbnail } from './pdfThumbnailService';
import { uploadPDFToSupabase } from './pdfUploadService';
import { getUserPDFs, getPDFById, updatePDFMetadata, deletePDF, getPDF } from './pdfManagementService';
import { 
  addChatMessageToPDF, 
  getChatMessagesForPDF, 
  deleteAllChatMessagesForPDF,
  SupabaseChatMessage
} from './pdfChatService';
import { getFriendlyPDFTitle } from './pdfStorage';

// Re-export all types and functions for backward compatibility
export type { SupabasePDF, AnalysisStage } from './pdfTypes';
export type { SupabaseChatMessage };
export { 
  generatePDFThumbnail,
  uploadThumbnail,
  uploadPDFToSupabase,
  getUserPDFs,
  getPDFById,
  getPDF,
  updatePDFMetadata,
  deletePDF,
  addChatMessageToPDF,
  getChatMessagesForPDF,
  deleteAllChatMessagesForPDF,
  getFriendlyPDFTitle
};
