import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  author?: string;
  canonicalUrl?: string;
  noindex?: boolean;
}

const SEO = ({
  title = 'Gemi Chat PDF – Chat PDF for Free with AI',
  description = 'Use Gemi Chat PDF to chat with your PDFs for free. Upload any document and instantly get answers using AI. Fast, free, and accurate PDF chat assistant.',
  keywords = 'Gemi Chat PDF, chat PDF for free, free PDF chat, AI PDF chat, Gemi AI, document assistant, PDF AI reader',
  ogImage = '/og-image.png',
  ogUrl = 'https://chatpdf.icu',
  author = 'Gemi Chat PDF Team',
  canonicalUrl = 'https://chatpdf.icu',
  noindex = false,
}: SEOProps) => {
  const fullOgUrl = ogUrl || canonicalUrl || (typeof window !== 'undefined' ? window.location.href : '');

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Gemi Chat PDF",
    "url": "https://chatpdf.icu",
    "description": description,
    "applicationCategory": "Productivity",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "operatingSystem": "All",
    "featureList": [
      "Free PDF chat",
      "Gemi AI PDF assistant",
      "Document Q&A",
      "Instant PDF search"
    ],
    "screenshot": ogImage
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Gemi Chat PDF",
    "url": "https://chatpdf.icu",
    "logo": ogImage,
    "sameAs": [
      "https://twitter.com/GemiChatPDF",
      "https://www.linkedin.com/company/gemichatpdf"
    ]
  };

  return (
    <Helmet>
      {/* Primary Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:site_name" content="Gemi Chat PDF" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Gemi Chat PDF – Free AI PDF Chat Assistant" />
      <meta name="twitter:description" content="Chat with PDFs for free using Gemi Chat PDF. Upload your file and ask questions instantly." />
      <meta name="twitter:image" content={ogImage} />

      {/* Mobile Meta */}
      <meta name="theme-color" content="#4f46e5" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="format-detection" content="telephone=no" />

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(webAppSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
    </Helmet>
  );
};

export default SEO;
