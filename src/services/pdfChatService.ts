import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupabaseChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

// Add a chat message to a PDF
export const addChatMessageToPDF = async (
  pdfId: string, 
  content: string, 
  isUser: boolean
): Promise<SupabaseChatMessage | null> => {
  try {
    const messageData = {
      pdf_id: pdfId,
      content: content,
      is_user: isUser
    };
    
    const { data, error } = await supabase
      .from('pdf_chats')
      .insert(messageData)
      .select('id, content, is_user, timestamp')
      .single();
      
    if (error) {
      console.error('Error adding chat message:', error);
      toast.error('Failed to add message');
      return null;
    }
    
    return {
      id: data.id,
      content: data.content,
      isUser: data.is_user,
      timestamp: new Date(data.timestamp)
    };
  } catch (error) {
    console.error('Error in addChatMessageToPDF:', error);
    toast.error('Failed to add message');
    return null;
  }
};

// Get chat messages for a PDF
export const getChatMessagesForPDF = async (pdfId: string): Promise<SupabaseChatMessage[]> => {
  try {
    const { data, error } = await supabase
      .from('pdf_chats')
      .select('*')
      .eq('pdf_id', pdfId)
      .order('timestamp', { ascending: true });
      
    if (error) {
      console.error('Error fetching chat messages:', error);
      toast.error('Failed to fetch chat messages');
      return [];
    }
    
    return data.map((message: any) => ({
      id: message.id,
      content: message.content,
      isUser: message.is_user,
      timestamp: new Date(message.timestamp)
    }));
  } catch (error) {
    console.error('Error in getChatMessagesForPDF:', error);
    toast.error('Failed to fetch chat messages');
    return [];
  }
};

// Delete all chat messages for a PDF
export const deleteAllChatMessagesForPDF = async (pdfId: string): Promise<boolean> => {
  try {
    console.log('Deleting all chat messages for PDF:', pdfId);
    
    if (!pdfId) {
      console.error('Invalid PDF ID provided for deleteAllChatMessagesForPDF');
      toast.error('Cannot delete messages: Invalid PDF ID');
      return false;
    }
    
    // First check if there are any messages to delete
    const { count, error: countError } = await supabase
      .from('pdf_chats')
      .select('*', { count: 'exact', head: true })
      .eq('pdf_id', pdfId);
      
    if (countError) {
      console.error('Error counting chat messages:', countError);
      toast.error('Failed to count chat messages');
      return false;
    }
    
    console.log(`Found ${count} messages to delete for PDF ID:`, pdfId);
    
    if (!count || count === 0) {
      console.log('No messages found to delete for PDF ID:', pdfId);
      toast.success('No messages to clear');
      return true;
    }
    
    // Attempt direct deletion first - simpler approach
    console.log('Attempting direct bulk deletion of all messages');
    const { error: bulkDeleteError } = await supabase
      .from('pdf_chats')
      .delete()
      .eq('pdf_id', pdfId);
    
    // Check if bulk deletion succeeded
    if (!bulkDeleteError) {
      console.log('Bulk deletion successful');
      toast.success('Chat history cleared successfully');
      return true;
    }
    
    // If bulk delete fails, log error and try Edge Function approach
    console.error('Bulk delete failed:', bulkDeleteError);
    console.log('Falling back to Edge Function for deletion');
    
    // Use Edge Function as a fallback
    const { error: functionError } = await supabase.functions.invoke('delete-pdf-chats', {
      body: { pdfId }
    });
    
    if (functionError) {
      console.error('Edge Function delete failed:', functionError);
      toast.error('Failed to delete chat messages');
      return false;
    }
    
    console.log('Edge Function deletion completed successfully');
    toast.success('Chat history cleared successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteAllChatMessagesForPDF:', error);
    toast.error('Failed to delete chat messages');
    return false;
  }
};
