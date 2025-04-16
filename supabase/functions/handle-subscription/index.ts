
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYPAL_API_URL = 'https://api-m.paypal.com'
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const PAYPAL_SECRET_KEY = Deno.env.get('PAYPAL_SECRET_KEY')

async function getPayPalAccessToken() {
  console.log("Getting PayPal access token")
  
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET_KEY) {
    console.error("Missing PayPal credentials")
    throw new Error("Missing PayPal credentials")
  }
  
  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET_KEY}`)
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("PayPal token error:", errorText)
    throw new Error(`PayPal token error: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  console.log("PayPal token obtained successfully")
  return data.access_token
}

async function verifySubscription(subscriptionId: string, accessToken: string) {
  console.log("Verifying subscription:", subscriptionId)
  
  if (!accessToken) {
    throw new Error("No PayPal access token available")
  }
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error(`PayPal subscription verification error: ${response.status}`, errorText)
    throw new Error(`PayPal subscription verification error: ${response.status} ${errorText}`)
  }
  
  const data = await response.json()
  console.log("PayPal subscription details:", JSON.stringify(data))
  return data
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { subscriptionId, planId, action, paypalPlanId } = await req.json()
    
    console.log("Received request:", { subscriptionId, planId, action, paypalPlanId })
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not found")
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')?.split(' ')[1]
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader)
    
    if (userError || !user) {
      console.error("Unauthorized - User error:", userError)
      throw new Error('Unauthorized')
    }
    
    console.log("Authenticated user:", user.id)

    // Verify subscription with PayPal
    const accessToken = await getPayPalAccessToken()
    const subscription = await verifySubscription(subscriptionId, accessToken)
    console.log("Subscription details from PayPal:", JSON.stringify(subscription))

    if (!subscription.id) {
      console.error("Invalid subscription response:", subscription)
      throw new Error('Invalid subscription ID or PayPal API error')
    }

    // Check if this is just a refresh request
    if (action === 'refresh') {
      console.log("Processing refresh request")
      
      // Just update the status based on PayPal's response
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('paypal_subscription_id', subscriptionId)
        .eq('user_id', user.id)
        .single()
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is code for "no rows returned"
        console.error("Error fetching existing subscription:", fetchError)
        throw fetchError
      }

      // If no subscription found, return error
      if (!existingSubscription) {
        console.error("Subscription not found in database")
        throw new Error('Subscription not found in database')
      }
      
      console.log("Updating existing subscription status:", subscription.status)
      
      // Get dates to use
      const currentPeriodStart = new Date(subscription.start_time)
      let currentPeriodEnd
      
      if (subscription.billing_info?.next_billing_time) {
        currentPeriodEnd = new Date(subscription.billing_info.next_billing_time)
      } else if (subscription.billing_info?.last_payment?.time) {
        // If no next billing time, add 30 days to last payment
        currentPeriodEnd = new Date(subscription.billing_info.last_payment.time)
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
      } else {
        // Fallback: 30 days from now
        currentPeriodEnd = new Date()
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
      }
      
      // Update status based on PayPal data
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          status: subscription.status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          updated_at: new Date(),
        })
        .eq('id', existingSubscription.id)
        .select()
        .single()
      
      if (error) {
        console.error("Error updating subscription:", error)
        throw error
      }
      
      console.log("Subscription refreshed successfully:", data)
      
      return new Response(JSON.stringify({ success: true, data, refreshed: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // For new subscription creation
    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED') {
      console.log("Processing active subscription")
      
      // Check if subscription already exists
      const { data: existingSubscription, error: fetchError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('paypal_subscription_id', subscriptionId)
        .single()
      
      if (existingSubscription) {
        console.log("Updating existing subscription:", existingSubscription.id)
        
        // Get dates to use
        const currentPeriodStart = new Date(subscription.start_time)
        let currentPeriodEnd
        
        if (subscription.billing_info?.next_billing_time) {
          currentPeriodEnd = new Date(subscription.billing_info.next_billing_time)
        } else if (subscription.billing_info?.last_payment?.time) {
          currentPeriodEnd = new Date(subscription.billing_info.last_payment.time)
          currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
        } else {
          currentPeriodEnd = new Date()
          currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
        }
        
        // Update existing subscription
        const { data, error } = await supabase
          .from('user_subscriptions')
          .update({
            status: subscription.status,
            current_period_start: currentPeriodStart,
            current_period_end: currentPeriodEnd,
            updated_at: new Date(),
          })
          .eq('id', existingSubscription.id)
          .select()
          .single()
        
        if (error) {
          console.error("Error updating existing subscription:", error)
          throw error
        }
        
        console.log("Existing subscription updated:", data)
        
        return new Response(JSON.stringify({ success: true, data, updated: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      
      console.log("Creating new subscription for user:", user.id)
      
      // Get dates for new subscription
      const currentPeriodStart = new Date(subscription.start_time)
      let currentPeriodEnd
      
      if (subscription.billing_info?.next_billing_time) {
        currentPeriodEnd = new Date(subscription.billing_info.next_billing_time)
      } else if (subscription.billing_info?.last_payment?.time) {
        currentPeriodEnd = new Date(subscription.billing_info.last_payment.time)
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
      } else {
        currentPeriodEnd = new Date()
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
      }
      
      // Store new subscription in database
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          paypal_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
        })
        .select()
        .single()

      if (error) {
        console.error("Error inserting new subscription:", error)
        throw error
      }

      console.log("New subscription created successfully:", data)
      
      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.error("Subscription not active:", subscription.status)
    throw new Error(`Subscription not active: ${subscription.status}`)

  } catch (error) {
    console.error("Error handling subscription:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
