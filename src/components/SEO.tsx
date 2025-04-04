
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  author?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleSection?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  schema?: any;
}

const SEO = ({ 
  title = 'Gemi ChatPDF - Free AI PDF Chat & Reader',
  description = 'Chat with PDFs for free using Gemi AI! Upload any PDF and get instant answers.',
  keywords = 'Gemi ChatPDF, PDF chat, AI PDF reader, chat with PDF, PDF analysis',
  ogImage = '/og-image.png',
  ogUrl = 'https://chatpdf.icu',
  author = 'Gemi ChatPDF Team',
  articlePublishedTime,
  articleModifiedTime,
  articleSection,
  canonicalUrl,
  noindex = false,
  schema
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
      ogUrlTag.setAttribute('content', ogUrl || canonicalUrl || window.location.href);
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

    // Update article meta tags for blog posts
    if (articlePublishedTime) {
      // Create or update article:published_time meta tag
      let articlePublishedTag = document.querySelector('meta[property="article:published_time"]');
      if (!articlePublishedTag) {
        articlePublishedTag = document.createElement('meta');
        articlePublishedTag.setAttribute('property', 'article:published_time');
        document.head.appendChild(articlePublishedTag);
      }
      articlePublishedTag.setAttribute('content', articlePublishedTime);

      // Set Open Graph type to article for blog posts
      const ogTypeTag = document.querySelector('meta[property="og:type"]');
      if (ogTypeTag) {
        ogTypeTag.setAttribute('content', 'article');
      }

      // Create or update article:author meta tag
      let articleAuthorTag = document.querySelector('meta[property="article:author"]');
      if (!articleAuthorTag) {
        articleAuthorTag = document.createElement('meta');
        articleAuthorTag.setAttribute('property', 'article:author');
        document.head.appendChild(articleAuthorTag);
      }
      articleAuthorTag.setAttribute('content', author);
    }

    // Set article:modified_time if provided
    if (articleModifiedTime) {
      let articleModifiedTag = document.querySelector('meta[property="article:modified_time"]');
      if (!articleModifiedTag) {
        articleModifiedTag = document.createElement('meta');
        articleModifiedTag.setAttribute('property', 'article:modified_time');
        document.head.appendChild(articleModifiedTag);
      }
      articleModifiedTag.setAttribute('content', articleModifiedTime);
    }

    // Set article:section if provided
    if (articleSection) {
      let articleSectionTag = document.querySelector('meta[property="article:section"]');
      if (!articleSectionTag) {
        articleSectionTag = document.createElement('meta');
        articleSectionTag.setAttribute('property', 'article:section');
        document.head.appendChild(articleSectionTag);
      }
      articleSectionTag.setAttribute('content', articleSection);
    }

    // Set robots meta for noindex if needed
    if (noindex) {
      let robotsTag = document.querySelector('meta[name="robots"]');
      if (!robotsTag) {
        robotsTag = document.createElement('meta');
        robotsTag.setAttribute('name', 'robots');
        document.head.appendChild(robotsTag);
      }
      robotsTag.setAttribute('content', 'noindex,nofollow');
    } else {
      // Ensure robots meta tag is set to index,follow if it exists
      const existingRobotsTag = document.querySelector('meta[name="robots"]');
      if (existingRobotsTag) {
        existingRobotsTag.setAttribute('content', 'index,follow');
      }
    }

  }, [title, description, keywords, ogImage, ogUrl, author, articlePublishedTime, articleModifiedTime, articleSection, canonicalUrl, noindex]);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={articlePublishedTime ? 'article' : 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={ogUrl || canonicalUrl || window.location.href} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Article specific tags */}
      {articlePublishedTime && <meta property="article:published_time" content={articlePublishedTime} />}
      {articleModifiedTime && <meta property="article:modified_time" content={articleModifiedTime} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {articlePublishedTime && <meta property="article:author" content={author} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Robots */}
      {noindex ? 
        <meta name="robots" content="noindex,nofollow" /> : 
        <meta name="robots" content="index,follow" />
      }
      
      {/* Structured data */}
      {schema && <script type="application/ld+json">{JSON.stringify(schema)}</script>}
    </Helmet>
  );
};

export default SEO;
