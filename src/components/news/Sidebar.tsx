import { Link } from "@tanstack/react-router";
import { Flame, Quote, Megaphone } from "lucide-react";
import { type Article, timeAgo, toBn } from "@/lib/news";

export function Sidebar({ articles }: { articles: Article[] }) {
  const mostRead = [...articles].sort((a, b) => b.views - a.views).slice(0, 6);
  const opinions = articles.filter((a) => a.category_slug === "motamot").slice(0, 2);

  return (
    <aside className="space-y-6">
      <section className="slab">
        <h2 className="flex items-center gap-2 border-b-[3px] border-border bg-ink px-3 py-2 text-lg text-paper">
          <Flame className="h-4 w-4 shrink-0" /> সর্বাধিক পঠিত
        </h2>
        <ol className="divide-y-[2px] divide-dashed divide-border">
          {mostRead.map((a, i) => (
            <li key={a.id}>
              <Link
                to="/article/$slug"
                params={{ slug: a.slug }}
                className="flex gap-3 p-3 hover:bg-highlight/40"
              >
                <span className="font-display text-2xl leading-none text-live">{toBn(i + 1)}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-snug">{a.title}</span>
                  <span className="mt-1 block text-[0.7rem] text-muted-foreground">
                    {timeAgo(a.published_at)} · {toBn(a.views)} পাঠ
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="slab">
        <h2 className="flex items-center gap-2 border-b-[3px] border-border bg-highlight px-3 py-2 text-lg text-foreground">
          <Quote className="h-4 w-4 shrink-0" /> মতামত
        </h2>
        <div className="divide-y-[2px] divide-dashed divide-border">
          {opinions.map((a) => (
            <Link
              key={a.id}
              to="/article/$slug"
              params={{ slug: a.slug }}
              className="block p-3 hover:bg-highlight/40"
            >
              <p className="font-serif text-base leading-snug">{a.title}</p>
              <p className="mt-1 text-[0.72rem] text-muted-foreground">{a.dek}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="slab bg-background p-4 text-center">
        <p className="kicker text-muted-foreground">বিজ্ঞাপন</p>
        <Megaphone className="mx-auto mt-3 h-8 w-8" />
        <p className="mt-2 font-display text-lg">আপনার ব্র্যান্ড এখানে</p>
        <p className="mt-1 text-xs text-muted-foreground">
          দৈনিক ১২ লাখ পাঠকের কাছে পৌঁছাতে যোগাযোগ করুন
        </p>
        <Link
          to="/contact"
          className="slab-sm slab-press mt-3 inline-block bg-live px-3 py-1.5 text-sm font-bold text-accent-foreground"
        >
          যোগাযোগ করুন
        </Link>
      </section>
    </aside>
  );
}