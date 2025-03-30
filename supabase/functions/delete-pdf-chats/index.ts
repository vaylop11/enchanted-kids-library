
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    const { pdfId } = requestData;

    console.log("Edge function received request to delete chats for PDF:", pdfId);

    if (!pdfId) {
      console.error("Missing pdfId in request");
      return new Response(
        JSON.stringify({ success: false, error: "Missing PDF ID" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Attempting to delete all chat messages for PDF:", pdfId);

    // Execute the delete operation with service role
    const { error, count } = await supabaseClient
      .from("pdf_chats")
      .delete({ count: 'exact' })
      .eq("pdf_id", pdfId);

    if (error) {
      console.error("Error deleting messages:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    console.log(`Successfully deleted ${count || 'all'} messages for PDF: ${pdfId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `All messages deleted successfully (count: ${count || 'unknown'})` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in PDF chat deletion function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
