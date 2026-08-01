import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Article = {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  category_slug: string;
  media_type: string;
  image_url: string | null;
  video_url: string | null;
  is_lead: boolean;
  is_breaking: boolean;
  views: number;
  source_count: number;
  risk_score: number;
  published_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  accent: string;
  sort_order: number;
};

export type LearningItem = {
  id: string;
  title: string;
  summary: string;
  level: string;
  duration: string;
  thumbnail_url: string | null;
};

export type AutomationRun = {
  id: string;
  started_at: string;
  finished_at: string | null;
  fetched: number;
  published: number;
  skipped: number;
  status: string;
  note: string;
};

const ARTICLE_COLUMNS =
  "id, slug, title, dek, body, category_slug, media_type, image_url, video_url, is_lead, is_breaking, views, source_count, risk_score, published_at";

export const categoriesQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("id, slug, name, accent, sort_order")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as Category[];
  },
});

export const articlesQuery = queryOptions({
  queryKey: ["articles", "latest"],
  queryFn: async (): Promise<Article[]> => {
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(60);
    if (error) throw new Error(error.message);
    return (data ?? []) as Article[];
  },
});

export const learningQuery = queryOptions({
  queryKey: ["learning-hub"],
  queryFn: async (): Promise<LearningItem[]> => {
    const { data, error } = await supabase
      .from("learning_hub")
      .select("id, title, summary, level, duration, thumbnail_url")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return (data ?? []) as LearningItem[];
  },
});

export const automationQuery = queryOptions({
  queryKey: ["automation-runs"],
  queryFn: async (): Promise<AutomationRun[]> => {
    const { data, error } = await supabase
      .from("automation_runs")
      .select("id, started_at, finished_at, fetched, published, skipped, status, note")
      .order("started_at", { ascending: false })
      .limit(20);
    // Automation logs are internal: anonymous visitors get no rows.
    if (error) return [];
    return (data ?? []) as AutomationRun[];
  },
});

export function articleQuery(slug: string) {
  return queryOptions({
    queryKey: ["article", slug],
    queryFn: async (): Promise<Article | null> => {
      const { data, error } = await supabase
        .from("articles")
        .select(ARTICLE_COLUMNS)
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return (data ?? null) as Article | null;
    },
  });
}

const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBn(value: number | string): string {
  return String(value).replace(/\d/g, (d) => BN_DIGITS[Number(d)]!);
}

export function bnDate(date: Date = new Date()): string {
  return toBn(
    new Intl.DateTimeFormat("bn-BD", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date),
  );
}

export function timeAgo(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${toBn(mins)} মিনিট আগে`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${toBn(hours)} ঘণ্টা আগে`;
  return `${toBn(Math.round(hours / 24))} দিন আগে`;
}