import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header to identify user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Get subscription ID from request
    const { subscriptionId } = await req.json();
    if (!subscriptionId) {
      throw new Error('Missing subscriptionId');
    }

    console.log('Verifying PayPal subscription:', subscriptionId);

    // Get PayPal credentials from environment
    const paypalClientId = Deno.env.get('PAYPAL_CLIENT_ID');
    const paypalSecretKey = Deno.env.get('PAYPAL_SECRET_KEY');

    if (!paypalClientId || !paypalSecretKey) {
      throw new Error('PayPal credentials not configured');
    }

    // Get PayPal access token
    const authResponse = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${paypalClientId}:${paypalSecretKey}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('PayPal auth failed:', errorText);
      throw new Error('Failed to authenticate with PayPal');
    }

    const { access_token } = await authResponse.json();

    // Verify subscription with PayPal
    const subscriptionResponse = await fetch(
      `https://api-m.paypal.com/v1/billing/subscriptions/${subscriptionId}`,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error('PayPal subscription verification failed:', errorText);
      throw new Error('Failed to verify subscription with PayPal');
    }

    const subscriptionData = await subscriptionResponse.json();
    
    if (subscriptionData.status !== 'ACTIVE') {
      throw new Error(`Subscription is not active. Status: ${subscriptionData.status}`);
    }

    console.log('Subscription verified:', subscriptionData);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('Invalid user token');
    }

    console.log('User identified:', user.id);

    // Get Gemi PRO plan ID
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('id')
      .eq('paypal_plan_id', subscriptionData.plan_id)
      .single();

    if (planError || !plan) {
      console.error('Error finding plan:', planError);
      throw new Error('Subscription plan not found');
    }

    console.log('Plan found:', plan.id);

    // Calculate period end (next billing time from PayPal or 30 days from now)
    const nextBillingTime = subscriptionData.billing_info?.next_billing_time;
    const periodEnd = nextBillingTime 
      ? new Date(nextBillingTime).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Store subscription in database
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: user.id,
        plan_id: plan.id,
        paypal_subscription_id: subscriptionId,
        status: 'ACTIVE',
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd
      }, {
        onConflict: 'user_id'
      });

    if (insertError) {
      console.error('Error storing subscription:', insertError);
      throw new Error('Failed to store subscription');
    }

    console.log('Subscription stored successfully');

    return new Response(
      JSON.stringify({ ok: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in verify-and-store-subscription:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
