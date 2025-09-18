import { createClient } from '@supabase/supabase-js';

// القيم هذو تلقاهم في Settings > API داخل Dashboard تاع Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
