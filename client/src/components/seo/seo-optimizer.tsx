import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
}

const pageSEOData: Record<string, SEOMetadata> = {
  '/': {
    title: 'Silent Surge Tracker - Advanced Cryptocurrency Intelligence Platform',
    description: 'Discover the next big crypto opportunities with our AI-powered Silent Surge Score. Professional-grade cryptocurrency analysis, real-time market intelligence, and institutional-level trading insights for 7,000+ digital assets.',
    keywords: 'cryptocurrency analysis, crypto trading, Silent Surge Score, blockchain intelligence, DeFi tokens, crypto AI, trading signals, market analysis, altcoin discovery, crypto investment',
    ogType: 'website',
    twitterCard: 'summary_large_image'
  },
  '/dashboard': {
    title: 'Crypto Dashboard - Real-Time Market Analysis | Silent Surge Tracker',
    description: 'Monitor 7,000+ cryptocurrencies with real-time Silent Surge Score analysis. Advanced behavioral metrics, velocity tracking, and institutional-grade market intelligence dashboard.',
    keywords: 'crypto dashboard, real-time analysis, market monitoring, Silent Surge Score, cryptocurrency metrics',
    ogType: 'website'
  },
  '/profile': {
    title: 'User Profile - Account Settings | Silent Surge Tracker',
    description: 'Manage your Silent Surge Tracker account settings, subscription preferences, and personalize your cryptocurrency analysis experience.',
    keywords: 'user profile, account settings, subscription management, crypto preferences'
  },
  '/subscribe': {
    title: 'Premium Subscription - Advanced Crypto Analysis | Silent Surge Tracker',
    description: 'Upgrade to Premium for advanced ML-powered crypto analysis, exclusive trading signals, and institutional-grade market intelligence. $29/month for professional traders.',
    keywords: 'premium subscription, advanced crypto analysis, ML trading signals, institutional grade, professional crypto tools',
    ogType: 'product'
  },
  '/phase3': {
    title: 'Phase 3 Features - Advanced Analytics | Silent Surge Tracker',
    description: 'Access cutting-edge cryptocurrency analysis with blockchain forensics, regulatory compliance monitoring, and institutional API management.',
    keywords: 'blockchain forensics, regulatory compliance, institutional API, advanced crypto analytics'
  }
};

export function SEOOptimizer() {
  const [location] = useLocation();

  useEffect(() => {
    const currentPath = location;
    const seoData = pageSEOData[currentPath] || pageSEOData['/'];

    // Update document title
    document.title = seoData.title;

    // Update meta tags
    updateMetaTag('description', seoData.description);
    updateMetaTag('keywords', seoData.keywords || '');
    
    // Update Open Graph tags
    updateMetaProperty('og:title', seoData.title);
    updateMetaProperty('og:description', seoData.description);
    updateMetaProperty('og:type', seoData.ogType || 'website');
    updateMetaProperty('og:url', window.location.href);
    
    // Update Twitter Card tags
    updateMetaProperty('twitter:title', seoData.title);
    updateMetaProperty('twitter:description', seoData.description);
    updateMetaProperty('twitter:card', seoData.twitterCard || 'summary');

    // Update canonical URL
    updateCanonical(seoData.canonical || window.location.href);

    // Add structured data for current page
    updateStructuredData(currentPath, seoData);

  }, [location]);

  return null; // This component doesn't render anything
}

function updateMetaTag(name: string, content: string) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateMetaProperty(property: string, content: string) {
  if (!content) return;
  
  let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

function updateCanonical(url: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}

function updateStructuredData(path: string, seoData: SEOMetadata) {
  // Remove existing structured data
  const existingScript = document.querySelector('script[type="application/ld+json"]#page-structured-data');
  if (existingScript) {
    existingScript.remove();
  }

  let structuredData: any = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": seoData.title,
    "description": seoData.description,
    "url": window.location.href,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Silent Surge Tracker",
      "url": window.location.origin
    }
  };

  // Add specific structured data based on page
  switch (path) {
    case '/':
      structuredData = {
        ...structuredData,
        "@type": "WebApplication",
        "applicationCategory": "FinanceTechnology",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "category": "Software",
          "priceCurrency": "USD",
          "price": "29.00"
        }
      };
      break;
    
    case '/subscribe':
      structuredData = {
        ...structuredData,
        "@type": "Product",
        "name": "Silent Surge Tracker Premium",
        "description": "Advanced cryptocurrency analysis platform",
        "offers": {
          "@type": "Offer",
          "price": "29.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "validFrom": new Date().toISOString()
        }
      };
      break;
  }

  // Add the structured data script
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.id = 'page-structured-data';
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}

// Hook for programmatic SEO updates
export function useSEO(metadata: Partial<SEOMetadata>) {
  useEffect(() => {
    if (metadata.title) document.title = metadata.title;
    if (metadata.description) updateMetaTag('description', metadata.description);
    if (metadata.keywords) updateMetaTag('keywords', metadata.keywords);
    if (metadata.canonical) updateCanonical(metadata.canonical);
  }, [metadata]);
}

// Generate dynamic SEO for crypto detail pages
export function generateCryptoSEO(symbol: string, name: string, price: number, sssScore: number): SEOMetadata {
  return {
    title: `${name} (${symbol}) - Live Price $${price.toFixed(4)} | SSS: ${sssScore} | Silent Surge Tracker`,
    description: `Real-time ${name} (${symbol}) analysis with Silent Surge Score of ${sssScore}. Current price: $${price.toFixed(4)}. Get advanced crypto insights, trading signals, and behavioral analysis.`,
    keywords: `${name}, ${symbol}, cryptocurrency, price analysis, Silent Surge Score, crypto trading, ${symbol} price, blockchain analysis`,
    canonical: `/crypto/${symbol.toLowerCase()}`
  };
}