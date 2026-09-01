import type { MetadataRoute } from 'next';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

/**
 * Served at /robots.txt.
 *
 * Set NEXT_PUBLIC_ALLOW_INDEXING=false on staging or preview deployments to
 * block crawlers there without touching production behaviour — duplicate
 * indexed copies of the site would otherwise compete with it in search.
 */
export default function robots(): MetadataRoute.Robots {
  const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING !== 'false';

  if (!allowIndexing) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Nothing here is secret, but these paths have no search value.
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml', site.url),
    host: site.url,
  };
}
