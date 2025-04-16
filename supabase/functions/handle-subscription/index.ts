
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
    const { subscriptionId, planId, action } = await req.json()
    
    console.log("Received request:", { subscriptionId, planId, action })
    
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

    // For new subscription creation
    if (subscription.status === 'ACTIVE' || subscription.status === 'APPROVED') {
      console.log("Processing active subscription")
      
      // Get subscription dates
      const currentPeriodStart = new Date(subscription.start_time)
      let currentPeriodEnd = new Date(subscription.billing_info?.next_billing_time || Date.now())
      
      // If next_billing_time is not available, add 30 days
      if (!subscription.billing_info?.next_billing_time) {
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30)
      }

      // Create or update subscription
      const { data: subData, error: subError } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          plan_id: planId,
          paypal_subscription_id: subscriptionId,
          status: subscription.status,
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
        })
        .select()
        .single()

      if (subError) {
        console.error("Error creating/updating subscription:", subError)
        throw subError
      }

      console.log("Subscription created/updated successfully:", subData)
      
      return new Response(JSON.stringify({ success: true, data: subData }), {
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
