import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type FeedArticle = {
  slug: string;
  title: string;
  dek: string;
  body: string;
  category_slug: string;
  image_url: string | null;
  video_url: string | null;
  media_type: string;
  published_at: string;
};

function publicClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export async function fetchFeedArticles(categorySlug?: string, limit = 50): Promise<FeedArticle[]> {
  let query = publicClient()
    .from("articles")
    .select(
      "slug, title, dek, body, category_slug, image_url, video_url, media_type, published_at",
    )
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);
  if (categorySlug) query = query.eq("category_slug", categorySlug);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as FeedArticle[];
}

export async function fetchFeedCategories(): Promise<{ slug: string; name: string }[]> {
  const { data, error } = await publicClient()
    .from("categories")
    .select("slug, name")
    .order("sort_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as { slug: string; name: string }[];
}
