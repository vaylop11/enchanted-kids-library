
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
}

const SEO = ({ 
  title = 'Gemi ChatPDF - Free AI PDF Chat & Reader',
  description = 'Chat with PDFs for free using Gemi AI! Upload any PDF and get instant answers.',
  keywords = 'Gemi ChatPDF, PDF chat, AI PDF reader, chat with PDF, PDF analysis',
  ogImage = '/og-image.png',
  ogUrl = 'https://chatpdf.icu'
}: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = title;
    
    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    // Update Open Graph meta tags
    const ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (ogTitleTag) {
      ogTitleTag.setAttribute('content', title);
    }

    const ogDescTag = document.querySelector('meta[property="og:description"]');
    if (ogDescTag) {
      ogDescTag.setAttribute('content', description);
    }

    const ogImageTag = document.querySelector('meta[property="og:image"]');
    if (ogImageTag) {
      ogImageTag.setAttribute('content', ogImage);
    }

    const ogUrlTag = document.querySelector('meta[property="og:url"]');
    if (ogUrlTag) {
      ogUrlTag.setAttribute('content', ogUrl);
    }

    // Update Twitter Card meta tags
    const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitleTag) {
      twitterTitleTag.setAttribute('content', title);
    }

    const twitterDescTag = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescTag) {
      twitterDescTag.setAttribute('content', description);
    }

    const twitterImageTag = document.querySelector('meta[name="twitter:image"]');
    if (twitterImageTag) {
      twitterImageTag.setAttribute('content', ogImage);
    }
  }, [title, description, keywords, ogImage, ogUrl]);

  return null; // This component doesn't render anything
};

export default SEO;
