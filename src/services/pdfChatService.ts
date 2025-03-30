
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
    
    // First, get a count of how many messages we're dealing with
    const { count: initialCount, error: countError } = await supabase
      .from('pdf_chats')
      .select('*', { count: 'exact', head: true })
      .eq('pdf_id', pdfId);
      
    if (countError) {
      console.error('Error counting chat messages:', countError);
      toast.error('Failed to count chat messages');
      return false;
    }
    
    console.log(`Found ${initialCount} messages to delete for PDF ID:`, pdfId);
    
    if (!initialCount || initialCount === 0) {
      console.log('No messages found to delete for PDF ID:', pdfId);
      toast.success('No messages to clear');
      return true;
    }
    
    // Get all message IDs that need to be deleted
    const { data: messagesToDelete, error: fetchError } = await supabase
      .from('pdf_chats')
      .select('id')
      .eq('pdf_id', pdfId);
      
    if (fetchError || !messagesToDelete) {
      console.error('Error fetching message IDs for deletion:', fetchError);
      toast.error('Failed to fetch messages for deletion');
      return false;
    }
    
    console.log(`Retrieved ${messagesToDelete.length} message IDs for deletion`);
    
    // Direct delete without batching first - simpler approach
    const { error: bulkDeleteError } = await supabase
      .from('pdf_chats')
      .delete()
      .eq('pdf_id', pdfId);
    
    if (bulkDeleteError) {
      console.error('Bulk delete failed, falling back to ID-based deletion:', bulkDeleteError);
      
      // If bulk delete fails, try deleting messages in small batches by ID
      const messageIds = messagesToDelete.map((msg: any) => msg.id);
      const batchSize = 5;
      let totalDeleted = 0;
      
      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batchToDelete = messageIds.slice(i, i + batchSize);
        console.log(`Deleting batch ${Math.floor(i/batchSize) + 1} (${batchToDelete.length} messages)`);
        
        const { error: batchDeleteError } = await supabase
          .from('pdf_chats')
          .delete()
          .in('id', batchToDelete);
        
        if (batchDeleteError) {
          console.error(`Error deleting batch ${Math.floor(i/batchSize) + 1}:`, batchDeleteError);
        } else {
          totalDeleted += batchToDelete.length;
          console.log(`Successfully deleted batch ${Math.floor(i/batchSize) + 1}`);
        }
        
        // Add a small delay between batches
        if (i + batchSize < messageIds.length) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      if (totalDeleted === 0) {
        console.error('All deletion attempts failed');
        toast.error('Failed to delete any messages');
        return false;
      }
    }
    
    // Verify deletion with a delay to allow for any database operations to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { count: finalCount, error: finalCountError } = await supabase
      .from('pdf_chats')
      .select('*', { count: 'exact', head: true })
      .eq('pdf_id', pdfId);
      
    if (finalCountError) {
      console.error('Error verifying message deletion:', finalCountError);
      toast.warning('Could not verify complete message deletion');
      return true; // We did attempt to delete, so consider it a partial success
    }
    
    if (finalCount && finalCount > 0) {
      console.log(`Deletion partially successful. ${initialCount - finalCount} messages deleted, ${finalCount} messages remain.`);
      toast.warning(`Deleted some messages, but ${finalCount} messages remain`);
      
      // One final attempt with a different approach for any remaining messages
      try {
        // Fix the RPC call by using the proper parameter structure
        const { error: finalDeleteError } = await supabase.functions.invoke('delete-pdf-chats', {
          body: { pdfId }
        });
        
        if (finalDeleteError) {
          console.error('Final delete attempt failed:', finalDeleteError);
        } else {
          console.log('Executed final delete attempt using edge function');
          toast.success('Chat history cleared successfully');
          return true;
        }
      } catch (rpcError) {
        console.error('Edge function call error:', rpcError);
      }
      
      return initialCount !== finalCount; // Return true if we deleted at least some messages
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
