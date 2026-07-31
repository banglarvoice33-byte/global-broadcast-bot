import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articlesQuery, categoriesQuery } from "@/lib/news";
import { ArticleCard } from "@/components/news/ArticleCard";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({ q: String(search["q"] ?? "") }),
  head: () => ({
    meta: [
      { title: "সংবাদ অনুসন্ধান — বাংলার ভয়েস" },
      { name: "description", content: "শিরোনাম ও সারসংক্ষেপে দ্রুত সংবাদ অনুসন্ধান করুন।" },
      { property: "og:title", content: "সংবাদ অনুসন্ধান — বাংলার ভয়েস" },
      { property: "og:description", content: "আর্কাইভে দ্রুত অনুসন্ধান।" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const needle = q.toLowerCase();
  const results = needle
    ? articles.filter(
        (a) =>
          a.title.toLowerCase().includes(needle) ||
          a.dek.toLowerCase().includes(needle) ||
          a.body.toLowerCase().includes(needle),
      )
    : [];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="slab inline-block bg-card px-4 py-2 text-2xl">
        অনুসন্ধান: <span className="text-live">{q}</span>
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {results.map((a) => (
          <ArticleCard key={a.id} article={a} categories={categories} size="sm" />
        ))}
      </div>
      {!results.length ? (
        <p className="mt-6 text-muted-foreground">কোনো ফলাফল পাওয়া যায়নি।</p>
      ) : null}
    </div>
  );
}