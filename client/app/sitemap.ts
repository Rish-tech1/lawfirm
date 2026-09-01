import type { MetadataRoute } from 'next';
import { practiceAreas, staticRoutes } from '@/content';
import { site } from '@/content/site';
import { absoluteUrl } from '@/lib/utils';

/**
 * Generated sitemap, served at /sitemap.xml.
 *
 * Driven by `staticRoutes` and the practice-area data, so a new practice area
 * appears in the sitemap the moment its JSON entry is added — no second edit,
 * and no route silently missing from search engines.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: absoluteUrl(route.path, site.url),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const areaPages: MetadataRoute.Sitemap = practiceAreas.map((area) => ({
    url: absoluteUrl(`/practice-areas/${area.slug}`, site.url),
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...pages, ...areaPages];
}
