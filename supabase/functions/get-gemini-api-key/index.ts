
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to get the API key from the database
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'GEMINI_API_KEY')
      .single();
    
    let apiKey = null;
    
    if (error) {
      // If there's an error or no record, fall back to environment variable
      console.log("No API key in database, using environment variable");
      apiKey = Deno.env.get("GEMINI_API_KEY");
    } else {
      apiKey = data.value;
    }

    // If the api key exists, only return a masked version for security
    let response = {
      apiKey: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : null
    };
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error getting Gemini API key:", error);
    
    return new Response(JSON.stringify({ error: "Failed to get API key" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
