
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYPAL_API_URL = 'https://api-m.paypal.com'
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')

async function getPayPalAccessToken() {
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    })
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching PayPal access token: ${response.status} ${errorText}`);
      throw new Error(`PayPal token error: ${response.status}`);
    }
    
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
}

async function verifySubscription(subscriptionId: string, accessToken: string) {
  console.log("Verifying subscription:", subscriptionId);
  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error verifying subscription: ${response.status} ${errorText}`);
      throw new Error(`PayPal subscription verification error: ${response.status}`);
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error verifying PayPal subscription:", error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { subscriptionId, planId, action } = await req.json()
    
    if (!subscriptionId) {
      throw new Error('Subscription ID is required')
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials missing')
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }
    
    console.log("Processing subscription for user:", user.id);

    // Verify subscription with PayPal
    const accessToken = await getPayPalAccessToken()
    console.log("Got PayPal access token");
    
    const subscription = await verifySubscription(subscriptionId, accessToken)
    console.log("Subscription details from PayPal:", subscription);

    if (!subscription.id) {
      throw new Error('Invalid subscription ID or PayPal API error')
    }

    // Handle different subscription statuses
    const allowedStatuses = ['ACTIVE', 'APPROVED', 'SUSPENDED'];
    if (!allowedStatuses.includes(subscription.status)) {
      throw new Error(`Subscription not in allowed status: ${subscription.status}`)
    }
    
    // Check if this is just a refresh request
    if (action === 'refresh') {
      // Just update the status based on PayPal's response
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('paypal_subscription_id', subscriptionId)
        .maybeSingle()
      
      if (fetchError) {
        console.error("Error fetching subscription:", fetchError);
        throw fetchError
      }

      // If no subscription found, return error
      if (!existingSubscription) {
        throw new Error('Subscription not found in database')
      }
      
      // Determine next billing time or end date
      let periodEnd = new Date();
      if (subscription.billing_info?.next_billing_time) {
        periodEnd = new Date(subscription.billing_info.next_billing_time);
      } else if (subscription.billing_info?.last_payment?.time) {
        periodEnd = new Date(subscription.billing_info.last_payment.time);
        // Add 1 month if we're using last payment time
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        // Default to 1 month from now
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }
      
      // Update status based on PayPal data
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.start_time),
          current_period_end: periodEnd,
          updated_at: new Date(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()
      
      if (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }
      
      console.log("Updated subscription:", data);
      return new Response(JSON.stringify({ success: true, data, refreshed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // For new subscription creation or updates
    // First check if subscription already exists
    const { data: existingSubscription, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('paypal_subscription_id', subscriptionId)
      .maybeSingle()
    
    if (fetchError) {
      console.error("Error checking existing subscription:", fetchError);
    }
    
    // Determine next billing time or end date
    let periodEnd = new Date();
    if (subscription.billing_info?.next_billing_time) {
      periodEnd = new Date(subscription.billing_info.next_billing_time);
    } else if (subscription.billing_info?.last_payment?.time) {
      periodEnd = new Date(subscription.billing_info.last_payment.time);
      // Add 1 month if we're using last payment time
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      // Default to 1 month from now
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }
    
    if (existingSubscription) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.start_time),
          current_period_end: periodEnd,
          updated_at: new Date(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()
      
      if (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }
      
      console.log("Updated existing subscription:", data);
      return new Response(JSON.stringify({ success: true, data, updated: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    // Store new subscription in database
    const { data, error } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan_id: planId,
        paypal_subscription_id: subscriptionId,
        status: subscription.status,
        current_period_start: new Date(subscription.start_time),
        current_period_end: periodEnd,
      })
      .select()
      .single()

    if (error) {
      console.error("Error inserting new subscription:", error);
      throw error;
    }

    console.log("Created new subscription:", data);
    return new Response(JSON.stringify({ success: true, data, created: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error("Error handling subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
