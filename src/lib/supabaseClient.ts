import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://nknrkkzegbrkqtutmafo.supabase.co";  // 🔗 ضع رابط مشروعك
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbnJra3plZ2Jya3F0dXRtYWZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyNTQzNzUsImV4cCI6MjA1NzgzMDM3NX0.SggdJAWbi2cSM3gGP08NgCJLO2txiju9BivxU7Pznjk";   // 🔑 ضع الـ anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
