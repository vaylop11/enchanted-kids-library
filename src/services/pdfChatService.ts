
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
    const { data: existingMessages, error: checkError } = await supabase
      .from('pdf_chats')
      .select('id')
      .eq('pdf_id', pdfId);
      
    if (checkError) {
      console.error('Error checking existing chat messages:', checkError);
      toast.error('Failed to check existing chat messages');
      return false;
    }
    
    if (!existingMessages || existingMessages.length === 0) {
      console.log('No messages found to delete for PDF ID:', pdfId);
      toast.success('No messages to clear');
      return true; // No messages to delete is still a success
    }
    
    console.log(`Found ${existingMessages.length} messages to delete for PDF ID:`, pdfId);
    
    // Delete the messages one batch at a time to avoid RLS issues
    // We'll delete in batches to ensure all messages are properly removed
    const batchSize = 50;
    const totalMessages = existingMessages.length;
    let deletedCount = 0;
    
    // Get all message IDs to delete
    const messageIds = existingMessages.map((msg: any) => msg.id);
    
    // Delete in batches
    for (let i = 0; i < totalMessages; i += batchSize) {
      const batchIds = messageIds.slice(i, i + batchSize);
      
      const { error: deleteError } = await supabase
        .from('pdf_chats')
        .delete()
        .in('id', batchIds);
        
      if (deleteError) {
        console.error(`Error deleting batch of messages (${i} to ${i + batchSize}):`, deleteError);
        toast.error(`Failed to delete some messages: ${deleteError.message}`);
        // Continue with other batches even if this one failed
      } else {
        deletedCount += batchIds.length;
      }
    }
    
    // Final verification to check if all messages were deleted
    const { count, error: countError } = await supabase
      .from('pdf_chats')
      .select('*', { count: 'exact', head: true })
      .eq('pdf_id', pdfId);
      
    if (countError) {
      console.error('Error verifying message deletion:', countError);
      toast.error('Could not verify complete message deletion');
      return deletedCount > 0; // Return true if we deleted at least some messages
    }
    
    if (count && count > 0) {
      console.error(`Delete operation partially successful. ${count} messages still remain.`);
      toast.warning(`Deleted ${deletedCount} messages, but ${count} messages remain`);
      return false;
    }
    
    console.log('Successfully deleted all chat messages for PDF ID:', pdfId);
    toast.success('Chat history cleared successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteAllChatMessagesForPDF:', error);
    toast.error('Failed to delete chat messages');
    return false;
  }
};
