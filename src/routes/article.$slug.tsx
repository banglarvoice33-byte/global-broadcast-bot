import { createFileRoute, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ShieldCheck, Bot } from "lucide-react";
import { articleQuery, articlesQuery, categoriesQuery, timeAgo, toBn } from "@/lib/news";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Sidebar } from "@/components/news/Sidebar";

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ context, params }) => {
    const article = await context.queryClient.ensureQueryData(articleQuery(params.slug));
    if (!article) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
    ]);
    return { title: article.title, dek: article.dek, image: article.image_url };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "প্রতিবেদন পাওয়া যায়নি" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `${loaderData.title} — বাংলার ভয়েস` },
        { name: "description", content: loaderData.dek },
        { property: "og:title", content: loaderData.title },
        { property: "og:description", content: loaderData.dek },
        ...(loaderData.image
          ? [
              { property: "og:image", content: loaderData.image },
              { name: "twitter:image", content: loaderData.image },
            ]
          : []),
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(articleQuery(slug));
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  if (!article) return null;

  const related = articles
    .filter((a) => a.category_slug === article.category_slug && a.id !== article.id)
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <article className="slab bg-card">
          {article.media_type === "video" && article.video_url ? (
            <div className="aspect-video w-full border-b-[3px] border-border bg-black">
              <iframe
                src={article.video_url}
                title={article.title}
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          ) : article.image_url ? (
            <img
              src={article.image_url}
              alt={article.title}
              className="h-64 w-full border-b-[3px] border-border object-cover sm:h-[420px]"
            />
          ) : null}
          <div className="space-y-4 p-4 sm:p-6">
            <span className="kicker inline-block border-[3px] border-border bg-highlight px-2 py-1">
              {categories.find((c) => c.slug === article.category_slug)?.name}
            </span>
            <h1 className="text-3xl leading-tight sm:text-4xl">{article.title}</h1>
            <p className="font-serif text-lg text-muted-foreground">{article.dek}</p>
            <div className="flex flex-wrap items-center gap-3 border-y-[3px] border-border py-2 text-xs">
              <span className="inline-flex items-center gap-1 font-bold">
                <Bot className="h-4 w-4 shrink-0" /> এআই নিউজরুম ডেস্ক
              </span>
              <span>{timeAgo(article.published_at)}</span>
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 shrink-0" /> {toBn(article.source_count)} স্বাধীন সূত্রে
                যাচাই
              </span>
              <span>ঝুঁকি স্কোর {toBn(article.risk_score)}</span>
            </div>
            <div className="space-y-4 font-serif text-[1.05rem] leading-relaxed">
              {article.body.split("\n").filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <p className="border-[3px] border-dashed border-border p-3 text-xs text-muted-foreground">
              এই প্রতিবেদনটি স্বয়ংক্রিয় এআই পাইপলাইনে তৈরি এবং প্রকাশের আগে একাধিক সূত্রে যাচাই ও
              ঝুঁকি-স্কোর গেট পাস করেছে।
            </p>
          </div>
        </article>
        <Sidebar articles={articles} />
      </div>

      {related.length ? (
        <section className="mt-10">
          <h2 className="border-b-[3px] border-border pb-2 text-2xl">সম্পর্কিত সংবাদ</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} categories={categories} size="sm" />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}