
// This file is kept for backward compatibility
// Chat functionality has been removed

export interface SupabaseChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Placeholder functions with warning logs
export const addChatMessageToPDF = async () => {
  console.warn('Chat functionality has been removed');
  return null;
};

export const getChatMessagesForPDF = async () => {
  console.warn('Chat functionality has been removed');
  return [];
};

export const deleteAllChatMessagesForPDF = async () => {
  console.warn('Chat functionality has been removed');
  return true;
};
