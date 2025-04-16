
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
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await response.json()
  return data.access_token
}

async function verifySubscription(subscriptionId: string, accessToken: string) {
  console.log("Verifying subscription:", subscriptionId);
  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  return await response.json()
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { subscriptionId, planId, action } = await req.json()
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const supabase = createClient(supabaseUrl!, supabaseKey!)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Verify subscription with PayPal
    const accessToken = await getPayPalAccessToken()
    const subscription = await verifySubscription(subscriptionId, accessToken)
    console.log("Subscription details from PayPal:", subscription)

    if (!subscription.id) {
      throw new Error('Invalid subscription ID or PayPal API error')
    }

    // Check if this is just a refresh request
    if (action === 'refresh') {
      // Just update the status based on PayPal's response
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('paypal_subscription_id', subscriptionId)
        .eq('user_id', user.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
        throw fetchError
      }

      // If no subscription found, return error
      if (!existingSubscription) {
        throw new Error('Subscription not found in database')
      }
      
      // Update status based on PayPal data
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.start_time),
          current_period_end: new Date(subscription.billing_info.next_billing_time || subscription.billing_info.last_payment.time),
          updated_at: new Date(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()
      
      if (error) throw error
      
      return new Response(JSON.stringify({ success: true, data, refreshed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // For new subscription creation
    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED') {
      // Check if subscription already exists
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('paypal_subscription_id', subscriptionId)
        .single()
      
      if (existingSubscription) {
        // Update existing subscription
        const { data, error } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.start_time),
            current_period_end: new Date(subscription.billing_info.next_billing_time || subscription.billing_info.last_payment.time),
            updated_at: new Date(),
          })
          .eq('id', existingSubscription.id)
          .select()
          .single()
        
        if (error) throw error
        
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
          current_period_end: new Date(subscription.billing_info.next_billing_time || 
                                        (subscription.billing_info.last_payment ? 
                                         subscription.billing_info.last_payment.time : 
                                         new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))),
        })
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error(`Subscription not active: ${subscription.status}`)

  } catch (error) {
    console.error("Error handling subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
