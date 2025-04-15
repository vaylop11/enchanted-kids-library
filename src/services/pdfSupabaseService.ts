
import { supabase } from '@/integrations/supabase/client';

export const getSupabasePDFById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching PDF from Supabase:', error);
    throw error;
  }
};
