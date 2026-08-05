import { createFileRoute } from "@tanstack/react-router";
import { fetchFeedArticles, fetchFeedCategories } from "@/lib/feed.server";
import { renderRss } from "@/lib/rss.server";

export const Route = createFileRoute("/rss/$category.xml")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const slug = String(params.category ?? "").slice(0, 60);
        const categories = await fetchFeedCategories();
        const category = categories.find((c) => c.slug === slug);
        if (!category) return new Response("Category not found", { status: 404 });
        const articles = await fetchFeedArticles(slug, 50);
        return new Response(renderRss(articles, category), {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=300, s-maxage=300",
          },
        });
      },
    },
  },
});
