
import { PDF } from '@/components/PDFCard';

// Common interface for both local and Supabase PDFs
export interface BasePDF extends PDF {
  id: string;
  title: string;
  summary: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string;
  analyzed?: boolean;
  text?: string;
}

// Local storage PDF type
export interface UploadedPDF extends BasePDF {
  dataUrl: string;
  fileUrl?: string;
  numPages?: number;
  chatMessages?: ChatMessage[];
}

// Supabase PDF type
export interface SupabasePDF extends BasePDF {
  filePath: string;
  fileUrl: string;
  thumbnail?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  userId?: string;
}
