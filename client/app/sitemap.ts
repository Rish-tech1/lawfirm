import type { MetadataRoute } from 'next';
import { practiceAreas, staticRoutes } from '@/content';
import { CONTENT_LAST_REVIEWED, site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

/**
 * Generated sitemap, served at /sitemap.xml.
 *
 * Driven by `staticRoutes` and the practice-area data, so a new practice area
 * appears in the sitemap the moment its JSON entry is added — no second edit,
 * and no route silently missing from search engines.
 *
 * On `lastmod`: this used to be `new Date()` for every URL, which is the build
 * timestamp. That told crawlers the entire site changed on every deploy —
 * including deploys that only touched styling — and a crawler repeatedly
 * promised a change it then cannot find stops believing the field. Each entry
 * now carries the date its own copy was last revised, falling back to the
 * site-wide `CONTENT_LAST_REVIEWED`, so an unchanged page reports an unchanged
 * date and a genuinely revised one stands out.
 */
const FALLBACK_LAST_MODIFIED = new Date(CONTENT_LAST_REVIEWED);

/** `undefined` and unparseable dates both fall back, rather than emitting `Invalid Date`. */
function lastModified(updated?: string): Date {
  if (!updated) return FALLBACK_LAST_MODIFIED;

  const parsed = new Date(updated);
  return Number.isNaN(parsed.getTime()) ? FALLBACK_LAST_MODIFIED : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path, site.url),
    lastModified: lastModified(route.updated),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const areaPages: MetadataRoute.Sitemap = practiceAreas.map((area) => ({
    url: absoluteUrl(`/practice-areas/${area.slug}`, site.url),
    lastModified: lastModified(area.updated),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...pages, ...areaPages];
}
