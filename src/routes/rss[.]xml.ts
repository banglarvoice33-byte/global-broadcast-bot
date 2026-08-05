import { createFileRoute } from "@tanstack/react-router";
import { fetchFeedArticles } from "@/lib/feed.server";
import { renderRss } from "@/lib/rss.server";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const articles = await fetchFeedArticles(undefined, 50);
        return new Response(renderRss(articles), {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
