
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
  title = 'Gemi Chat PDF – Chat PDF for Free with AI',
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
  // useEffect hook removed as per instructions
  // All meta tags are now handled declaratively by Helmet below

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
