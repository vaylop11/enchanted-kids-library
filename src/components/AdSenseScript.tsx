
import { useEffect, useState } from 'react';
import { supabaseUntyped } from '@/integrations/supabase/client';

const AdSenseScript = () => {
  const [publisherId, setPublisherId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublisherId = async () => {
      try {
        const { data, error } = await supabaseUntyped
          .from('adsense_settings')
          .select('publisher_id')
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching AdSense settings:', error);
          return;
        }
        
        if (data?.publisher_id) {
          setPublisherId(data.publisher_id);
        }
      } catch (error) {
        console.error('Error in fetchPublisherId:', error);
      }
    };

    fetchPublisherId();
  }, []);

  useEffect(() => {
    if (!publisherId) return;

    // Add the AdSense script to the document
    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      try {
        const existingScript = document.querySelector(`script[src*="${publisherId}"]`);
        if (existingScript && existingScript.parentNode) {
          existingScript.parentNode.removeChild(existingScript);
        }
      } catch (error) {
        console.error('Error removing AdSense script:', error);
      }
    };
  }, [publisherId]);

  // This component doesn't render anything
  return null;
};

export default AdSenseScript;
