import { GraduationCap, Clock } from "lucide-react";
import { type LearningItem } from "@/lib/news";

const LEVEL_BN: Record<string, string> = {
  beginner: "প্রাথমিক",
  intermediate: "মধ্যম",
  advanced: "উচ্চতর",
};

export function LearningHub({ items }: { items: LearningItem[] }) {
  return (
    <section className="slab bg-background">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b-[3px] border-border bg-highlight px-4 py-3 sm:flex sm:justify-between">
        <h2 className="flex min-w-0 items-center gap-2 text-xl text-foreground">
          <GraduationCap className="h-5 w-5 shrink-0" /> বাংলার ভয়েস লার্নিং হাব
        </h2>
        <span className="kicker shrink-0 border-[2px] border-border bg-card px-2 py-0.5">
          ফ্রি কোর্স
        </span>
      </div>
      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="slab-sm slab-press bg-card">
            {item.thumbnail_url ? (
              <img
                src={item.thumbnail_url}
                alt={item.title}
                loading="lazy"
                className="h-28 w-full border-b-[3px] border-border object-cover"
              />
            ) : null}
            <div className="space-y-1.5 p-3">
              <h3 className="text-base leading-snug">{item.title}</h3>
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.summary}</p>
              <div className="flex items-center justify-between pt-1 text-[0.68rem]">
                <span className="border-[2px] border-border px-1.5 py-0.5 font-bold">
                  {LEVEL_BN[item.level] ?? item.level}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" /> {item.duration}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}