import { createFileRoute } from "@tanstack/react-router";

/**
 * 24/7 AI newsroom cycle.
 * Called by pg_cron every 5 minutes (see docs/DEPLOYMENT.md).
 * 1. pulls global + Bangla wires (RSS)
 * 2. drops items already covered (slug/title dedupe)
 * 3. requires corroboration from >= 2 independent wires
 * 4. rewrites the story in Bengali with Lovable AI
 * 5. publishes and logs the run
 */

const WIRES = [
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "antorjatik" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "antorjatik" },
  { name: "NPR", url: "https://feeds.npr.org/1004/rss.xml", category: "antorjatik" },
  { name: "Guardian World", url: "https://www.theguardian.com/world/rss", category: "antorjatik" },
  { name: "BBC Business", url: "https://feeds.bbci.co.uk/news/business/rss.xml", category: "ortho" },
  { name: "BBC Tech", url: "https://feeds.bbci.co.uk/news/technology/rss.xml", category: "projukti" },
  { name: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml", category: "khela" },
  {
    name: "Google News BD",
    url: "https://news.google.com/rss/search?q=Bangladesh&hl=bn&gl=BD&ceid=BD:bn",
    category: "jatiyo",
  },
  {
    name: "Google News Politics BD",
    url: "https://news.google.com/rss/search?q=%E0%A6%B0%E0%A6%BE%E0%A6%9C%E0%A6%A8%E0%A7%80%E0%A6%A4%E0%A6%BF&hl=bn&gl=BD&ceid=BD:bn",
    category: "rajniti",
  },
  {
    name: "Google News Entertainment",
    url: "https://news.google.com/rss/search?q=entertainment&hl=en-US&gl=US&ceid=US:en",
    category: "binodon",
  },
];

type WireItem = { title: string; summary: string; link: string; source: string; category: string };

const STOP = new Set([
  "the",
  "a",
  "an",
  "of",
  "in",
  "on",
  "to",
  "for",
  "and",
  "with",
  "as",
  "at",
  "by",
  "is",
  "are",
  "after",
  "over",
  "from",
  "says",
  "new",
]);

function tokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP.has(w)),
  );
}

function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared += 1;
  return (2 * shared) / (a.size + b.size);
}

function strip(xml: string): string {
  return xml
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFeed(xml: string, source: string, category: string): WireItem[] {
  const items: WireItem[] = [];
  const blocks = xml.split(/<item[\s>]/i).slice(1);
  for (const block of blocks.slice(0, 12)) {
    const title = strip(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const summary = strip(block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? "");
    const link = strip(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? "");
    if (title) items.push({ title, summary, link, source, category });
  }
  return items;
}

async function pullWires(): Promise<WireItem[]> {
  const results = await Promise.allSettled(
    WIRES.map(async (wire) => {
      const res = await fetch(wire.url, {
        headers: { "user-agent": "BanglarVoiceAI/1.0 (+newsroom automation)" },
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) return [];
      return parseFeed(await res.text(), wire.name, wire.category);
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
}

type Cluster = { lead: WireItem; members: WireItem[] };

function cluster(items: WireItem[]): Cluster[] {
  const clusters: Cluster[] = [];
  for (const item of items) {
    const itemTokens = tokens(item.title);
    const hit = clusters.find((c) => dice(tokens(c.lead.title), itemTokens) >= 0.45);
    if (hit) hit.members.push(item);
    else clusters.push({ lead: item, members: [item] });
  }
  return clusters;
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base || "report"}-${Date.now().toString(36).slice(-5)}`;
}

async function rewriteInBengali(cluster: Cluster, apiKey: string) {
  const sources = cluster.members
    .map((m) => `- ${m.source}: ${m.title}. ${m.summary}`.slice(0, 400))
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [
        {
          role: "system",
          content:
            "You are the automated Bengali newsroom desk of 'বাংলার ভয়েস'. Rewrite wire copy as an original, neutral Bengali news report. Never invent facts, names, or numbers not present in the sources. Reply ONLY with minified JSON: {\"title\":string,\"dek\":string,\"body\":string}. body must contain 3 short Bengali paragraphs separated by \\n.",
        },
        { role: "user", content: `Sources:\n${sources}` },
      ],
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (res.status === 429) throw new Error("rate_limited");
  if (res.status === 402) throw new Error("ai_credits_exhausted");
  if (!res.ok) throw new Error(`ai_error_${res.status}`);

  const payload = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = payload.choices?.[0]?.message?.content ?? "";
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  const parsed = JSON.parse(json) as { title?: string; dek?: string; body?: string };
  if (!parsed.title || !parsed.body) throw new Error("ai_bad_shape");
  return { title: parsed.title, dek: parsed.dek ?? "", body: parsed.body };
}

export const Route = createFileRoute("/api/public/hooks/newscycle")({
  server: {
    handlers: {
      POST: async () => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "Missing LOVABLE_API_KEY" }, { status: 500 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: run } = await supabaseAdmin
          .from("automation_runs")
          .insert({ status: "running" })
          .select("id")
          .single();

        let fetched = 0;
        let published = 0;
        let skipped = 0;
        let note = "";

        try {
          const items = await pullWires();
          fetched = items.length;

          const { data: existing } = await supabaseAdmin
            .from("articles")
            .select("title")
            .order("published_at", { ascending: false })
            .limit(200);
          const existingTokens = (existing ?? []).map((a) => tokens(a.title));

          const corroborated = cluster(items)
            .filter((c) => c.members.length >= 2)
            .sort((a, b) => b.members.length - a.members.length);

          const fresh = corroborated.filter((c) => {
            const t = tokens(c.lead.title);
            const dup = existingTokens.some((e) => dice(e, t) >= 0.42);
            if (dup) skipped += 1;
            return !dup;
          });
          skipped += items.length - corroborated.length;

          for (const c of fresh.slice(0, 3)) {
            try {
              const story = await rewriteInBengali(c, apiKey);
              const { error } = await supabaseAdmin.from("articles").insert({
                slug: slugify(c.lead.title),
                title: story.title,
                dek: story.dek,
                body: story.body,
                category_slug: c.lead.category,
                media_type: "photo",
                source_count: c.members.length,
                risk_score: Number((1 / (c.members.length + 2)).toFixed(2)),
                status: "published",
              });
              if (error) throw new Error(error.message);
              published += 1;
            } catch (err) {
              skipped += 1;
              note = err instanceof Error ? err.message : "unknown_error";
            }
          }

          await supabaseAdmin
            .from("automation_runs")
            .update({
              finished_at: new Date().toISOString(),
              fetched,
              published,
              skipped,
              status: published ? "success" : "no_publish",
              note: note || `${WIRES.length} ওয়্যার স্ক্যান সম্পন্ন`,
            })
            .eq("id", run?.id ?? "");

          return Response.json({ ok: true, fetched, published, skipped });
        } catch (err) {
          const message = err instanceof Error ? err.message : "unknown_error";
          await supabaseAdmin
            .from("automation_runs")
            .update({
              finished_at: new Date().toISOString(),
              fetched,
              published,
              skipped,
              status: "failed",
              note: message,
            })
            .eq("id", run?.id ?? "");
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});