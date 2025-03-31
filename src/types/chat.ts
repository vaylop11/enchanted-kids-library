
import { ChatMessage } from '@/services/pdfStorage';
import { SupabaseChat } from '@/services/pdfSupabaseService';

// A union type to handle both local and Supabase chat messages
export type PDFChatMessage = ChatMessage | SupabaseChat;

// A helper function to normalize timestamps across both types of messages
export const formatMessageTimestamp = (message: PDFChatMessage): string => {
  if ('timestamp' in message) {
    // If it's a ChatMessage (Date type) or SupabaseChat (string type)
    if (message.timestamp instanceof Date) {
      return message.timestamp.toLocaleString();
    } else if (typeof message.timestamp === 'string') {
      return new Date(message.timestamp).toLocaleString();
    }
  }
  return '';
};

// A helper function to safely get the message ID regardless of type
export const getMessageId = (message: PDFChatMessage): string => {
  return message.id;
};

// A helper function to check if two messages are of the same type
export const isSameMessageType = (message1: PDFChatMessage, message2: PDFChatMessage): boolean => {
  const isMessage1Supabase = 'pdfId' in message1;
  const isMessage2Supabase = 'pdfId' in message2;
  return isMessage1Supabase === isMessage2Supabase;
};
