import { absoluteUrl } from "@/lib/site";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { PlayCircle, ArrowRight, ShieldCheck, Bot } from "lucide-react";
import {
  articlesQuery,
  categoriesQuery,
  learningQuery,
  automationQuery,
  timeAgo,
  toBn,
} from "@/lib/news";
import { ArticleCard } from "@/components/news/ArticleCard";
import { Sidebar } from "@/components/news/Sidebar";
import { LearningHub } from "@/components/news/LearningHub";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "বাংলার ভয়েস — ২৪/৭ এআই অটোমেটেড সংবাদমাধ্যম" },
      {
        name: "description",
        content:
          "লিড সংবাদ, ব্রেকিং টিকার, ভিডিও রিপোর্ট, সর্বাধিক পঠিত ও লার্নিং হাব — সবই এআই অটোমেশনে ২৪ ঘণ্টা হালনাগাদ।",
      },
      { property: "og:title", content: "বাংলার ভয়েস — ২৪/৭ এআই অটোমেটেড সংবাদমাধ্যম" },
      {
        property: "og:description",
        content: "একাধিক সূত্রে যাচাই করা সংবাদ, প্রতি পাঁচ মিনিটে স্বয়ংক্রিয় হালনাগাদ।",
      },
      { property: "og:url", content: absoluteUrl("/") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(articlesQuery),
      context.queryClient.ensureQueryData(categoriesQuery),
      context.queryClient.ensureQueryData(learningQuery),
      context.queryClient.ensureQueryData(automationQuery),
    ]);
  },
  component: Index,
});

function Index() {
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: learning } = useSuspenseQuery(learningQuery);
  const { data: runs } = useSuspenseQuery(automationQuery);

  const lead = articles.find((a) => a.is_lead) ?? articles[0];
  const rest = articles.filter((a) => a.id !== lead?.id);
  const secondary = rest.slice(0, 4);
  const videos = articles.filter((a) => a.media_type === "video");
  const lastRun = runs[0];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      {/* HERO / LEAD NEWS */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {lead ? (
            <article className="slab overflow-hidden">
              <Link to="/article/$slug" params={{ slug: lead.slug }}>
                {lead.image_url ? (
                  <img
                    src={lead.image_url}
                    alt={lead.title}
                    className="h-64 w-full border-b-[3px] border-border object-cover sm:h-[420px]"
                  />
                ) : null}
                <div className="space-y-3 p-4 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="kicker border-[3px] border-border bg-live px-2 py-1 text-accent-foreground">
                      লিড সংবাদ
                    </span>
                    <span className="kicker border-[3px] border-border bg-highlight px-2 py-1">
                      {categories.find((c) => c.slug === lead.category_slug)?.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(lead.published_at)} · {toBn(lead.source_count)} সূত্রে যাচাই
                    </span>
                  </div>
                  <h1 className="text-3xl leading-tight sm:text-5xl">{lead.title}</h1>
                  <p className="font-serif text-base text-muted-foreground sm:text-lg">{lead.dek}</p>
                  <span className="slab-sm slab-press inline-flex items-center gap-2 bg-ink px-3 py-2 text-sm font-bold text-paper">
                    পূর্ণ প্রতিবেদন <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </article>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            {secondary.map((a) => (
              <ArticleCard key={a.id} article={a} categories={categories} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="slab bg-card p-4">
            <h2 className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 shrink-0" /> অটোমেশন স্ট্যাটাস
            </h2>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
              {[
                ["সংগ্রহ", lastRun?.fetched ?? 0],
                ["প্রকাশিত", lastRun?.published ?? 0],
                ["বাদ", lastRun?.skipped ?? 0],
              ].map(([label, value]) => (
                <div key={label as string} className="border-[3px] border-border p-2">
                  <dt className="kicker text-muted-foreground">{label}</dt>
                  <dd className="font-display text-2xl">{toBn(value as number)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0" /> সর্বশেষ চক্র:{" "}
              {lastRun ? timeAgo(lastRun.started_at) : "—"}
            </p>
            <Link
              to="/newsroom"
              className="slab-sm slab-press mt-3 inline-block bg-highlight px-3 py-1.5 text-sm font-bold"
            >
              মনিটর দেখুন
            </Link>
          </div>
          <Sidebar articles={articles} />
        </div>
      </section>

      {/* LEARNING HUB */}
      <div className="mt-10">
        <LearningHub items={learning} />
      </div>

      {/* VIDEO / MULTIMEDIA */}
      {videos.length ? (
        <section className="slab mt-10 bg-ink text-paper">
          <h2 className="flex items-center gap-2 border-b-[3px] border-paper/40 px-4 py-3 text-xl">
            <PlayCircle className="h-5 w-5 shrink-0" /> ভিডিও ও মাল্টিমিডিয়া
          </h2>
          <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="border-[3px] border-paper">
              <div className="aspect-video w-full bg-black">
                {videos[0]?.video_url ? (
                  <iframe
                    src={videos[0].video_url}
                    title={videos[0].title}
                    allowFullScreen
                    className="h-full w-full"
                  />
                ) : null}
              </div>
              <div className="p-3">
                <h3 className="text-xl">{videos[0]?.title}</h3>
                <p className="mt-1 text-sm opacity-80">{videos[0]?.dek}</p>
              </div>
            </div>
            <ul className="space-y-3">
              {videos.slice(1, 5).map((v) => (
                <li key={v.id}>
                  <Link
                    to="/article/$slug"
                    params={{ slug: v.slug }}
                    className="flex gap-3 border-[3px] border-paper p-2 hover:bg-paper hover:text-ink"
                  >
                    {v.image_url ? (
                      <img
                        src={v.image_url}
                        alt={v.title}
                        loading="lazy"
                        className="h-16 w-24 shrink-0 border-[2px] border-current object-cover"
                      />
                    ) : null}
                    <span className="min-w-0 text-sm font-semibold leading-snug">{v.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* CATEGORY GRIDS */}
      {categories.map((cat) => {
        const items = articles.filter((a) => a.category_slug === cat.slug).slice(0, 4);
        if (!items.length) return null;
        return (
          <section key={cat.slug} className="mt-10">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b-[3px] border-border pb-2 sm:flex sm:justify-between">
              <h2 className="min-w-0 truncate text-2xl">{cat.name}</h2>
              <Link
                to="/category/$slug"
                params={{ slug: cat.slug }}
                className="kicker shrink-0 border-[3px] border-border bg-card px-2 py-1 hover:bg-highlight"
              >
                সব খবর
              </Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((a) => (
                <ArticleCard key={a.id} article={a} categories={categories} size="sm" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
