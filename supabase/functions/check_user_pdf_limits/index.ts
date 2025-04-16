
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
