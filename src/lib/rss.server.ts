import { absoluteUrl, escapeXml, SITE_NAME_BN, SITE_URL } from "@/lib/site";
import type { FeedArticle } from "@/lib/feed.server";

export function renderRss(
  articles: FeedArticle[],
  category?: { slug: string; name: string },
): string {
  const feedPath = category ? `/rss/${category.slug}.xml` : "/rss.xml";
  const title = category ? `${SITE_NAME_BN} — ${category.name}` : SITE_NAME_BN;

  const items = articles
    .map((a) => {
      const link = absoluteUrl(`/article/${a.slug}`);
      const enclosure = a.video_url
        ? `<enclosure url="${escapeXml(a.video_url)}" type="video/mp4"/>`
        : a.image_url
          ? `<enclosure url="${escapeXml(a.image_url)}" type="image/jpeg"/>`
          : "";
      const media = a.image_url
        ? `<media:content url="${escapeXml(a.image_url)}" medium="image"/>`
        : "";
      return (
        `<item><title>${escapeXml(a.title)}</title><link>${link}</link>` +
        `<guid isPermaLink="true">${link}</guid>` +
        `<pubDate>${new Date(a.published_at).toUTCString()}</pubDate>` +
        `<category>${escapeXml(a.category_slug)}</category>` +
        `<description>${escapeXml(a.dek)}</description>` +
        `<content:encoded><![CDATA[${a.body.replace(/]]>/g, "]]&gt;")}]]></content:encoded>` +
        `${enclosure}${media}</item>`
      );
    })
    .join("");

  return (
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" ` +
    `xmlns:content="http://purl.org/rss/1.0/modules/content/" ` +
    `xmlns:media="http://search.yahoo.com/mrss/">` +
    `<channel><title>${escapeXml(title)}</title><link>${SITE_URL}</link>` +
    `<description>২৪/৭ এআই অটোমেটেড বাংলা ও আন্তর্জাতিক সংবাদ</description>` +
    `<language>bn-BD</language>` +
    `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>` +
    `<atom:link href="${absoluteUrl(feedPath)}" rel="self" type="application/rss+xml"/>` +
    `${items}</channel></rss>`
  );
}
