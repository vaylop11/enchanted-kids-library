
CREATE OR REPLACE FUNCTION public.check_user_pdf_limits(user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    has_subscription boolean;
    pdf_count integer;
    result jsonb;
BEGIN
    -- Check if user has an active paid subscription
    SELECT EXISTS (
        SELECT 1
        FROM user_subscriptions
        WHERE user_subscriptions.user_id = $1
        AND status = 'ACTIVE'
        AND current_period_end > NOW()
    ) INTO has_subscription;

    -- Get user's current PDF count
    SELECT COUNT(*) 
    FROM pdfs 
    WHERE pdfs.user_id = $1 
    INTO pdf_count;

    -- Build result JSON
    result := jsonb_build_object(
        'has_paid_subscription', has_subscription,
        'current_pdf_count', pdf_count,
        'max_pdfs', CASE WHEN has_subscription THEN 20 ELSE 2 END,
        'max_file_size_mb', CASE WHEN has_subscription THEN 10 ELSE 5 END,
        'can_translate', has_subscription
    );

    RETURN result;
END;
$function$;
