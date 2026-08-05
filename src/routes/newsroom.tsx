import { absoluteUrl } from "@/lib/site";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Bot, ShieldCheck, Radio } from "lucide-react";
import { automationQuery, articlesQuery, timeAgo, toBn } from "@/lib/news";

export const Route = createFileRoute("/newsroom")({
  head: () => ({
    meta: [
      { title: "নিউজরুম মনিটর — ২৪/৭ এআই অটোমেশন" },
      {
        name: "description",
        content: "প্রতি চক্রে কত সংবাদ সংগ্রহ, প্রকাশ ও বাতিল হলো তার লাইভ অটোমেশন লগ।",
      },
      { property: "og:title", content: "নিউজরুম মনিটর — বাংলার ভয়েস" },
      { property: "og:description", content: "লাইভ এআই অটোমেশন পাইপলাইন লগ।" },
      { property: "og:url", content: absoluteUrl("/newsroom") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/newsroom") }],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(automationQuery),
      context.queryClient.ensureQueryData(articlesQuery),
    ]);
  },
  component: Newsroom,
});

function Newsroom() {
  const { data: runs } = useSuspenseQuery(automationQuery);
  const { data: articles } = useSuspenseQuery(articlesQuery);
  const totals = runs.reduce(
    (acc, r) => ({
      fetched: acc.fetched + r.fetched,
      published: acc.published + r.published,
      skipped: acc.skipped + r.skipped,
    }),
    { fetched: 0, published: 0, skipped: 0 },
  );

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <h1 className="slab inline-flex items-center gap-2 bg-live px-4 py-2 text-3xl text-accent-foreground">
        <Radio className="h-6 w-6 shrink-0 animate-pulse" /> নিউজরুম মনিটর
      </h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["মোট সংগ্রহ", totals.fetched, Activity],
          ["প্রকাশিত", totals.published, Bot],
          ["যাচাইয়ে বাতিল", totals.skipped, ShieldCheck],
          ["লাইভ প্রতিবেদন", articles.length, Radio],
        ].map(([label, value, Icon]) => {
          const I = Icon as typeof Activity;
          return (
            <div key={label as string} className="slab bg-card p-4">
              <p className="kicker flex items-center gap-2 text-muted-foreground">
                <I className="h-4 w-4 shrink-0" /> {label as string}
              </p>
              <p className="mt-2 font-display text-4xl">{toBn(value as number)}</p>
            </div>
          );
        })}
      </div>

      <section className="slab mt-8 bg-card">
        <h2 className="border-b-[3px] border-border bg-ink px-4 py-2 text-xl text-paper">
          অটোমেশন চক্রের লগ
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b-[3px] border-border bg-highlight">
              <tr className="kicker text-left">
                <th className="p-2">সময়</th>
                <th className="p-2">সংগ্রহ</th>
                <th className="p-2">প্রকাশ</th>
                <th className="p-2">বাদ</th>
                <th className="p-2">স্ট্যাটাস</th>
                <th className="p-2">নোট</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-dashed divide-border">
              {runs.map((r) => (
                <tr key={r.id}>
                  <td className="p-2 whitespace-nowrap">{timeAgo(r.started_at)}</td>
                  <td className="p-2">{toBn(r.fetched)}</td>
                  <td className="p-2">{toBn(r.published)}</td>
                  <td className="p-2">{toBn(r.skipped)}</td>
                  <td className="p-2">
                    <span className="border-[2px] border-border bg-background px-1.5 py-0.5 text-[0.7rem] font-bold">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-2 text-muted-foreground">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 border-[3px] border-dashed border-border p-4 text-sm text-muted-foreground">
        পাইপলাইন প্রতি ৫ মিনিটে ওয়্যার ফিড স্ক্যান করে, ডুপ্লিকেট ক্লাস্টার বাদ দেয়, দুই বা ততোধিক
        স্বাধীন সূত্রে করোবরেশন যাচাই করে, তারপর এআই দিয়ে বাংলা প্রতিবেদন লিখে প্রকাশ করে।
      </p>
    </div>
  );
}