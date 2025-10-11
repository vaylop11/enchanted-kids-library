-- إضافة unique constraint على paypal_plan_id
ALTER TABLE public.subscription_plans 
ADD CONSTRAINT unique_paypal_plan_id UNIQUE (paypal_plan_id);

-- إضافة/تحديث خطة Gemi PRO في subscription_plans
INSERT INTO public.subscription_plans (name, paypal_plan_id, price, currency, interval, description)
VALUES (
  'Gemi PRO',
  'P-0V356102U2698115XNDBPMCQ',
  9.99,
  'USD',
  'month',
  'خطة مميزة مع رفع غير محدود وملفات حتى 50MB'
)
ON CONFLICT (paypal_plan_id) 
DO UPDATE SET 
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  interval = EXCLUDED.interval,
  description = EXCLUDED.description,
  updated_at = now();