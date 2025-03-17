
import { supabase, supabaseUntyped } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const setupDatabase = async (): Promise<boolean> => {
  try {
    // Check if pdfs table exists - use supabaseUntyped for untyped table access
    const { error: tableCheckError } = await supabaseUntyped
      .from('pdfs')
      .select('id')
      .limit(1);
      
    // If table does not exist, create it
    if (tableCheckError && tableCheckError.message.includes('relation "pdfs" does not exist')) {
      console.log('PDFs table does not exist, creating...');
      
      // Create pdfs table - call the stored procedure
      const { error: createTableError } = await supabaseUntyped.rpc('create_pdfs_table');
      
      if (createTableError) {
        console.error('Error creating pdfs table:', createTableError);
        toast.error('Failed to set up database. Some features may not work correctly.');
        return false;
      }
    }
    
    // Check if pdf_chats table exists
    const { error: chatsTableCheckError } = await supabaseUntyped
      .from('pdf_chats')
      .select('id')
      .limit(1);
      
    // If table does not exist, create it
    if (chatsTableCheckError && chatsTableCheckError.message.includes('relation "pdf_chats" does not exist')) {
      console.log('PDF Chats table does not exist, creating...');
      
      // Create pdf_chats table
      const { error: createChatsTableError } = await supabaseUntyped.rpc('create_pdf_chats_table');
      
      if (createChatsTableError) {
        console.error('Error creating pdf_chats table:', createChatsTableError);
        toast.error('Failed to set up chat database. Chat features may not work correctly.');
        return false;
      }
    }
    
    // Create or check for pdfs bucket
    const { data: buckets } = await supabase.storage.listBuckets();
    
    if (!buckets?.find(bucket => bucket.name === 'pdfs')) {
      // Create pdfs bucket
      const { error: createBucketError } = await supabase.storage.createBucket('pdfs', {
        public: true
      });
      
      if (createBucketError) {
        console.error('Error creating pdfs bucket:', createBucketError);
        toast.error('Failed to set up storage. Upload features may not work correctly.');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in setupDatabase:', error);
    toast.error('Failed to set up database. Some features may not work correctly.');
    return false;
  }
};
