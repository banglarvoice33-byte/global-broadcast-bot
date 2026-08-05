import { createFileRoute } from "@tanstack/react-router";
import { fetchFeedArticles, fetchFeedCategories } from "@/lib/feed.server";
import { absoluteUrl, escapeXml } from "@/lib/site";

const STATIC_PATHS = ["/", "/learning", "/newsroom", "/contact", "/ethics", "/privacy", "/epaper"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [articles, categories] = await Promise.all([
          fetchFeedArticles(undefined, 500),
          fetchFeedCategories(),
        ]);

        const entries: string[] = [];
        for (const path of STATIC_PATHS) {
          entries.push(
            `<url><loc>${absoluteUrl(path)}</loc><changefreq>hourly</changefreq><priority>${path === "/" ? "1.0" : "0.6"}</priority>` +
              `<xhtml:link rel="alternate" hreflang="bn" href="${absoluteUrl(path)}"/>` +
              `<xhtml:link rel="alternate" hreflang="en" href="${absoluteUrl(path)}?lang=en"/>` +
              `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(path)}"/></url>`,
          );
        }
        for (const c of categories) {
          entries.push(
            `<url><loc>${absoluteUrl(`/category/${c.slug}`)}</loc><changefreq>hourly</changefreq><priority>0.7</priority></url>`,
          );
        }
        for (const a of articles) {
          entries.push(
            `<url><loc>${absoluteUrl(`/article/${a.slug}`)}</loc>` +
              `<lastmod>${new Date(a.published_at).toISOString()}</lastmod>` +
              `<changefreq>daily</changefreq><priority>0.8</priority>` +
              (a.image_url
                ? `<image:image><image:loc>${escapeXml(a.image_url)}</image:loc><image:title>${escapeXml(a.title)}</image:title></image:image>`
                : "") +
              `<news:news><news:publication><news:name>বাংলার ভয়েস</news:name><news:language>bn</news:language></news:publication>` +
              `<news:publication_date>${new Date(a.published_at).toISOString()}</news:publication_date>` +
              `<news:title>${escapeXml(a.title)}</news:title></news:news></url>`,
          );
        }

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
          `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" ` +
          `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" ` +
          `xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join("")}</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=600, s-maxage=600",
          },
        });
      },
    },
  },
});
