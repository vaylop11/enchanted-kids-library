-- Update check_user_pdf_limits function to set max_pdfs to 1 for free users
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

    -- Build result JSON with correct limits: 1 PDF for free, unlimited for PRO
    result := jsonb_build_object(
        'has_paid_subscription', has_subscription,
        'current_pdf_count', pdf_count,
        'max_pdfs', CASE WHEN has_subscription THEN -1 ELSE 1 END, -- 1 for free users, -1 (unlimited) for PRO
        'max_file_size_mb', CASE WHEN has_subscription THEN 50 ELSE 5 END,
        'can_translate', has_subscription,
        'plan_name', CASE WHEN has_subscription THEN 'Gemi PRO' ELSE 'Free' END
    );

    RETURN result;
END;
$function$;