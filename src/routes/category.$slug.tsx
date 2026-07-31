import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { articlesQuery, categoriesQuery } from "@/lib/news";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Sidebar } from "@/components/news/Sidebar";

export const Route = createFileRoute("/category/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} সেকশন — বাংলার ভয়েস` },
      { name: "description", content: "এআই অটোমেশনে হালনাগাদ সেকশনভিত্তিক সর্বশেষ সংবাদ।" },
      { property: "og:title", content: `${params.slug} সেকশন — বাংলার ভয়েস` },
      { property: "og:description", content: "সেকশনভিত্তিক সর্বশেষ যাচাইকৃত সংবাদ।" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const category = categories.find((c) => c.slug === slug);
  const items = articles.filter((a) => a.category_slug === slug);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="slab inline-block bg-highlight px-4 py-2 text-3xl">
        {category?.name ?? slug}
      </h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.length ? (
            items.map((a) => <ArticleCard key={a.id} article={a} categories={categories} />)
          ) : (
            <p className="text-muted-foreground">এই সেকশনে এখনো কোনো সংবাদ প্রকাশ হয়নি।</p>
          )}
        </div>
        <Sidebar articles={articles} />
      </div>
    </div>
  );
}