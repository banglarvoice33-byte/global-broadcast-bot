import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { CheckCircle2, EyeOff, Flame, Star, Trash2, ShieldAlert, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession, isStaff } from "@/lib/auth";
import { automationQuery, timeAgo, toBn } from "@/lib/news";
import { absoluteUrl } from "@/lib/site";

type StaffArticle = {
  id: string;
  slug: string;
  title: string;
  category_slug: string;
  status: string;
  is_lead: boolean;
  is_breaking: boolean;
  source_count: number;
  risk_score: number;
  published_at: string;
};

const staffArticlesQuery = queryOptions({
  queryKey: ["admin", "articles"],
  queryFn: async (): Promise<StaffArticle[]> => {
    const { data, error } = await supabase
      .from("articles")
      .select(
        "id, slug, title, category_slug, status, is_lead, is_breaking, source_count, risk_score, published_at",
      )
      .order("published_at", { ascending: false })
      .limit(80);
    if (error) throw new Error(error.message);
    return (data ?? []) as StaffArticle[];
  },
});

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "অ্যাডমিন প্যানেল — বাংলার ভয়েস নিউজরুম" },
      {
        name: "description",
        content: "অনুমোদিত স্টাফদের জন্য সম্পাদকীয় অনুমোদন, প্রকাশনা ও অটোমেশন নিয়ন্ত্রণ প্যানেল।",
      },
      { property: "og:title", content: "অ্যাডমিন প্যানেল — বাংলার ভয়েস" },
      { property: "og:description", content: "সম্পাদকীয় অনুমোদন ও প্রকাশনা নিয়ন্ত্রণ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:url", content: absoluteUrl("/admin") },
    ],
  }),
  component: AdminPanel,
});

function AdminPanel() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const staff = isStaff(session ?? null);
  const isAdmin = !!session?.roles.includes("admin");

  const { data: articles = [] } = useQuery({ ...staffArticlesQuery, enabled: staff });
  const { data: runs = [] } = useQuery({ ...automationQuery, enabled: staff });

  const patch = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Partial<StaffArticle> }) => {
      const { error } = await supabase.from("articles").update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "articles"] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "articles"] }),
  });

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    window.location.assign("/auth");
  };

  if (!session) return <div className="mx-auto max-w-[1400px] px-4 py-10">লোড হচ্ছে…</div>;

  if (!staff) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12">
        <div className="slab bg-card p-6">
          <h1 className="inline-flex items-center gap-2 font-display text-2xl">
            <ShieldAlert className="h-6 w-6 shrink-0" /> অনুমোদন প্রয়োজন
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            আপনি <strong>{session.email}</strong> হিসেবে সাইন ইন করেছেন, তবে এই অ্যাকাউন্টে
            অ্যাডমিন বা সম্পাদক রোল নেই। নিউজরুম ওয়ার্কফ্লো ব্যবহার করতে প্রশাসকের কাছ থেকে রোল
            অনুমোদন নিন।
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link to="/" className="slab-sm slab-press px-4 py-2 font-display text-sm">
              হোমপেজ
            </Link>
            <button
              onClick={signOut}
              className="slab-sm slab-press inline-flex items-center gap-2 bg-ink px-4 py-2 font-display text-sm text-paper"
            >
              <LogOut className="h-4 w-4" /> সাইন আউট
            </button>
          </div>
        </div>
      </div>
    );
  }

  const pending = articles.filter((a) => a.status !== "published");

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="slab inline-flex items-center gap-2 bg-live px-4 py-2 font-display text-2xl text-accent-foreground">
          অ্যাডমিন প্যানেল
        </h1>
        <div className="flex items-center gap-2 text-sm">
          <span className="border-[3px] border-border bg-card px-2 py-1 font-semibold">
            {session.displayName} · {session.roles.join(", ") || "স্টাফ"}
          </span>
          <button
            onClick={signOut}
            className="slab-sm slab-press inline-flex items-center gap-2 bg-ink px-3 py-2 font-display text-sm text-paper"
          >
            <LogOut className="h-4 w-4" /> সাইন আউট
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          ["মোট প্রতিবেদন", articles.length],
          ["অনুমোদনের অপেক্ষায়", pending.length],
          ["অটোমেশন চক্র", runs.length],
        ].map(([label, value]) => (
          <div key={label as string} className="slab bg-card p-4">
            <p className="kicker text-muted-foreground">{label as string}</p>
            <p className="mt-2 font-display text-4xl">{toBn(value as number)}</p>
          </div>
        ))}
      </div>

      <section className="slab mt-8 bg-card">
        <h2 className="border-b-[3px] border-border bg-ink px-4 py-2 font-display text-xl text-paper">
          সম্পাদকীয় সারি
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b-[3px] border-border bg-highlight">
              <tr className="kicker text-left">
                <th className="p-2">শিরোনাম</th>
                <th className="p-2">বিভাগ</th>
                <th className="p-2">স্ট্যাটাস</th>
                <th className="p-2">সূত্র</th>
                <th className="p-2">সময়</th>
                <th className="p-2">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y-[2px] divide-dashed divide-border">
              {articles.map((a) => (
                <tr key={a.id}>
                  <td className="max-w-[320px] p-2">
                    <Link
                      to="/article/$slug"
                      params={{ slug: a.slug }}
                      className="font-semibold hover:underline"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="p-2 whitespace-nowrap">{a.category_slug}</td>
                  <td className="p-2">
                    <span className="border-[2px] border-border bg-background px-1.5 py-0.5 text-[0.7rem] font-bold">
                      {a.status}
                    </span>
                  </td>
                  <td className="p-2">{toBn(a.source_count)}</td>
                  <td className="p-2 whitespace-nowrap">{timeAgo(a.published_at)}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {a.status === "published" ? (
                        <button
                          onClick={() => patch.mutate({ id: a.id, values: { status: "draft" } })}
                          className="slab-sm slab-press inline-flex items-center gap-1 px-2 py-1 text-[0.72rem]"
                          title="আনপাবলিশ"
                        >
                          <EyeOff className="h-3.5 w-3.5" /> আনপাবলিশ
                        </button>
                      ) : (
                        <button
                          onClick={() => patch.mutate({ id: a.id, values: { status: "published" } })}
                          className="slab-sm slab-press inline-flex items-center gap-1 bg-live px-2 py-1 text-[0.72rem] text-accent-foreground"
                          title="অনুমোদন ও প্রকাশ"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> অনুমোদন
                        </button>
                      )}
                      <button
                        onClick={() => patch.mutate({ id: a.id, values: { is_lead: !a.is_lead } })}
                        className={`slab-sm slab-press inline-flex items-center gap-1 px-2 py-1 text-[0.72rem] ${a.is_lead ? "bg-highlight" : ""}`}
                        title="লিড স্টোরি"
                      >
                        <Star className="h-3.5 w-3.5" /> লিড
                      </button>
                      <button
                        onClick={() =>
                          patch.mutate({ id: a.id, values: { is_breaking: !a.is_breaking } })
                        }
                        className={`slab-sm slab-press inline-flex items-center gap-1 px-2 py-1 text-[0.72rem] ${a.is_breaking ? "bg-highlight" : ""}`}
                        title="ব্রেকিং"
                      >
                        <Flame className="h-3.5 w-3.5" /> ব্রেকিং
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => remove.mutate(a.id)}
                          className="slab-sm slab-press inline-flex items-center gap-1 px-2 py-1 text-[0.72rem]"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> ডিলিট
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 border-[3px] border-dashed border-border p-4 text-sm text-muted-foreground">
        লাইভ অটোমেশন লগ দেখতে{" "}
        <Link to="/newsroom" className="font-semibold underline">
          নিউজরুম মনিটর
        </Link>{" "}
        ব্যবহার করুন। রোল ব্যবস্থাপনা কেবল অ্যাডমিন করতে পারেন।
      </p>
    </div>
  );
}
