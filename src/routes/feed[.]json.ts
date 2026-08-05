import { createFileRoute } from "@tanstack/react-router";
import { fetchFeedArticles } from "@/lib/feed.server";
import { absoluteUrl, SITE_NAME_BN, SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/feed.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const category = url.searchParams.get("category") ?? undefined;
        const articles = await fetchFeedArticles(category ?? undefined, 50);

        return Response.json(
          {
            version: "https://jsonfeed.org/version/1.1",
            title: SITE_NAME_BN,
            home_page_url: SITE_URL,
            feed_url: absoluteUrl("/feed.json"),
            language: "bn-BD",
            items: articles.map((a) => ({
              id: absoluteUrl(`/article/${a.slug}`),
              url: absoluteUrl(`/article/${a.slug}`),
              title: a.title,
              summary: a.dek,
              content_text: a.body,
              date_published: a.published_at,
              tags: [a.category_slug],
              ...(a.image_url ? { image: a.image_url } : {}),
              ...(a.video_url
                ? { attachments: [{ url: a.video_url, mime_type: "video/mp4" }] }
                : {}),
            })),
          },
          {
            headers: {
              "cache-control": "public, max-age=300, s-maxage=300",
            },
          },
        );
      },
    },
  },
});
