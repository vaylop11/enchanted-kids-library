
// Add this function to delete a specific chat message from Supabase
export const deleteSupabaseChatMessage = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('pdf_chats')
      .delete()
      .eq('id', messageId);
    
    if (error) {
      console.error('Error deleting chat message:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return false;
  }
};
