
// Base PDF interface with common properties
export interface BasePDF {
  id: string;
  title: string;
  summary: string;
  pageCount: number;
  fileSize: string;
  thumbnail?: string;
}

// Frontend PDF interface
export interface PDF extends BasePDF {
  uploadDate: string;
}

// Supabase PDF interface
export interface SupabasePDF extends BasePDF {
  user_id: string;
  file_path: string;
  upload_date: string;
  page_count: number;
  file_size: string;
  created_at: string;
  updated_at: string;
  fileUrl?: string;
}

export interface PDFChatMessage {
  id: string;
  pdf_id: string;
  is_user: boolean;
  content: string;
  timestamp: string;
  isUser?: boolean;
}

// For the PDF storage service
export interface UploadedPDF extends BasePDF {
  id: string;
  title: string;
  summary: string;
  uploadDate: string;
  pageCount: number;
  fileSize: string;
  dataUrl: string;
  thumbnail?: string;
  chatMessages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
