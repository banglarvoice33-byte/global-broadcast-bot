import { createFileRoute } from "@tanstack/react-router";
import { fetchFeedArticles } from "@/lib/feed.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const started = Date.now();
        const checks: Record<string, { ok: boolean; detail?: string }> = {};

        try {
          const articles = await fetchFeedArticles(undefined, 1);
          checks.database = { ok: true, detail: `${articles.length} row(s) reachable` };
          const latest = articles[0]?.published_at;
          const ageMinutes = latest
            ? Math.round((Date.now() - new Date(latest).getTime()) / 60000)
            : null;
          checks.content_freshness = {
            ok: ageMinutes !== null && ageMinutes < 720,
            detail: ageMinutes === null ? "no articles" : `${ageMinutes} minutes old`,
          };
        } catch (error) {
          checks.database = {
            ok: false,
            detail: error instanceof Error ? error.message : "unknown error",
          };
          checks.content_freshness = { ok: false, detail: "skipped" };
        }

        checks.ai_key = { ok: Boolean(process.env["LOVABLE_API_KEY"]) };
        checks.cron_secret = { ok: Boolean(process.env["NEWSCYCLE_CRON_SECRET"]) };

        const ok = Object.values(checks).every((c) => c.ok);
        return Response.json(
          { status: ok ? "ok" : "degraded", checks, latency_ms: Date.now() - started },
          { status: ok ? 200 : 503, headers: { "cache-control": "no-store" } },
        );
      },
    },
  },
});
