-- تحديث دالة check_user_pdf_limits لجعل فحص الحالة case-insensitive
CREATE OR REPLACE FUNCTION public.check_user_pdf_limits(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    has_subscription boolean;
    pdf_count integer;
    result jsonb;
BEGIN
    -- Check if user has an active Gemini Pro subscription (case-insensitive status check)
    SELECT EXISTS (
        SELECT 1
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE us.user_id = $1
        AND UPPER(us.status) = 'ACTIVE'
        AND us.current_period_end > NOW()
        AND sp.name = 'Gemi PRO'
    ) INTO has_subscription;

    -- Get user's current PDF count
    SELECT COUNT(*) 
    FROM pdfs 
    WHERE pdfs.user_id = $1 
    INTO pdf_count;

    -- Build result JSON with Gemini Pro unlimited limits
    result := jsonb_build_object(
        'has_paid_subscription', has_subscription,
        'current_pdf_count', pdf_count,
        'max_pdfs', CASE WHEN has_subscription THEN -1 ELSE 2 END, -- -1 means unlimited
        'max_file_size_mb', CASE WHEN has_subscription THEN 50 ELSE 5 END,
        'can_translate', has_subscription,
        'plan_name', CASE WHEN has_subscription THEN 'Gemi PRO' ELSE 'Free' END
    );

    RETURN result;
END;
$function$;