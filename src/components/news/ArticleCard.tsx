import { Link } from "@tanstack/react-router";
import { PlayCircle, Eye } from "lucide-react";
import { type Article, type Category, timeAgo, toBn } from "@/lib/news";

export function ArticleCard({
  article,
  categories,
  size = "md",
}: {
  article: Article;
  categories: Category[];
  size?: "sm" | "md";
}) {
  const category = categories.find((c) => c.slug === article.category_slug);
  return (
    <article className="slab-sm slab-press bg-card">
      <Link
        to="/article/$slug"
        params={{ slug: article.slug }}
        className="block focus-visible:outline-none"
      >
        {article.image_url ? (
          <div className="relative border-b-[3px] border-border">
            <img
              src={article.image_url}
              alt={article.title}
              loading="lazy"
              className={size === "sm" ? "h-32 w-full object-cover" : "h-44 w-full object-cover"}
            />
            {article.media_type === "video" ? (
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 border-[3px] border-border bg-live px-2 py-0.5 text-[0.65rem] font-bold text-accent-foreground">
                <PlayCircle className="h-3 w-3 shrink-0" /> ভিডিও
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="space-y-2 p-3">
          <div className="flex items-center gap-2">
            <span className="kicker border-[2px] border-border bg-highlight px-1.5 py-0.5 text-foreground">
              {category?.name ?? article.category_slug}
            </span>
            <span className="text-[0.7rem] text-muted-foreground">
              {timeAgo(article.published_at)}
            </span>
          </div>
          <h3 className={size === "sm" ? "text-base leading-snug" : "text-lg leading-snug"}>
            {article.title}
          </h3>
          {size === "md" ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">{article.dek}</p>
          ) : null}
          <div className="flex items-center gap-3 border-t-[2px] border-dashed border-border pt-2 text-[0.7rem] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="h-3 w-3 shrink-0" /> {toBn(article.views)}
            </span>
            <span>{toBn(article.source_count)} সূত্রে যাচাই</span>
          </div>
        </div>
      </Link>
    </article>
  );
}