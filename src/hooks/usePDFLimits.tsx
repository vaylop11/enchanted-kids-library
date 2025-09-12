import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface PDFLimits {
  has_paid_subscription: boolean;
  current_pdf_count: number;
  max_pdfs: number; // -1 means unlimited
  max_file_size_mb: number;
  can_translate: boolean;
  plan_name: string;
  isLoading: boolean;
}

export const usePDFLimits = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<PDFLimits>({
    has_paid_subscription: false,
    current_pdf_count: 0,
    max_pdfs: 2,
    max_file_size_mb: 5,
    can_translate: false,
    plan_name: 'Free',
    isLoading: true
  });

  const fetchLimits = async () => {
    if (!user) {
      setLimits(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const { data, error } = await supabase.rpc('check_user_pdf_limits', {
        user_id: user.id
      });

      if (error) throw error;

      const limitData = data as any;
      setLimits({
        has_paid_subscription: limitData.has_paid_subscription || false,
        current_pdf_count: limitData.current_pdf_count || 0,
        max_pdfs: limitData.max_pdfs || 2,
        max_file_size_mb: limitData.max_file_size_mb || 5,
        can_translate: limitData.can_translate || false,
        plan_name: limitData.plan_name || 'Free',
        isLoading: false
      });
    } catch (error) {
      console.error('Error fetching PDF limits:', error);
      setLimits(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchLimits();
  }, [user]);

  const canUploadPDF = (fileSize: number) => {
    const fileSizeMB = fileSize / (1024 * 1024);
    
    // Check file size limit
    if (fileSizeMB > limits.max_file_size_mb) {
      return {
        canUpload: false,
        reason: 'file_size',
        maxSize: limits.max_file_size_mb
      };
    }

    // Check PDF count limit (unlimited if max_pdfs is -1)
    if (limits.max_pdfs !== -1 && limits.current_pdf_count >= limits.max_pdfs) {
      return {
        canUpload: false,
        reason: 'pdf_limit',
        maxPdfs: limits.max_pdfs
      };
    }

    return { canUpload: true };
  };

  const isUnlimited = limits.max_pdfs === -1;

  return {
    ...limits,
    canUploadPDF,
    isUnlimited,
    refreshLimits: fetchLimits
  };
};