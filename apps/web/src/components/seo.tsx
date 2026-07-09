import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const SITE_NAME = 'Lumora';
const DEFAULT_DESCRIPTION =
  'Rise above the chaos of pings, infinite scrolling, and relentless demands. Discover how to protect your presence and create with intention.';
const DEFAULT_OG_IMAGE = '/og-image.png';

export function SEO({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  noIndex,
}: SEOProps) {
  const fullTitle = title
    ? `${title} — ${SITE_NAME}`
    : `${SITE_NAME} — Clarity in an Endlessly Noisy Universe`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || DEFAULT_DESCRIPTION} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || DEFAULT_DESCRIPTION} />
      <meta property="og:type" content={ogType} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {!ogImage && <meta property="og:image" content={DEFAULT_OG_IMAGE} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || DEFAULT_DESCRIPTION} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': ogType === 'article' ? 'Article' : 'WebSite',
          name: SITE_NAME,
          description: DEFAULT_DESCRIPTION,
          url: 'https://lumora.app',
        })}
      </script>
    </Helmet>
  );
}
