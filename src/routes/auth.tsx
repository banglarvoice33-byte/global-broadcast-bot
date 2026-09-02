import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, ShieldCheck, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { sessionQuery } from "@/lib/auth";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "নিউজরুম লগইন — বাংলার ভয়েস স্টাফ প্যানেল" },
      {
        name: "description",
        content:
          "অনুমোদিত সম্পাদক ও প্রশাসকদের জন্য বাংলার ভয়েস নিউজরুম অ্যাডমিন প্যানেলের নিরাপদ লগইন।",
      },
      { property: "og:title", content: "নিউজরুম লগইন — বাংলার ভয়েস" },
      { property: "og:description", content: "স্টাফ অ্যাডমিন প্যানেলে নিরাপদ প্রবেশ।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:url", content: absoluteUrl("/auth") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/auth") }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      if (tab === "in") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
        navigate({ to: "/admin", replace: true });
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
            data: { display_name: displayName },
          },
        });
        if (err) throw err;
        if (data.session) {
          await queryClient.invalidateQueries({ queryKey: sessionQuery.queryKey });
          navigate({ to: "/admin", replace: true });
        } else {
          setMessage("অ্যাকাউন্ট তৈরি হয়েছে। ইমেইলে পাঠানো নিশ্চিতকরণ লিংকে ক্লিক করুন।");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-[520px] px-4 py-10">
      <h1 className="slab inline-flex items-center gap-2 bg-live px-4 py-2 font-display text-2xl text-accent-foreground">
        <ShieldCheck className="h-6 w-6 shrink-0" /> নিউজরুম স্টাফ লগইন
      </h1>

      <div className="slab mt-6 bg-card">
        <div className="grid grid-cols-2 border-b-[3px] border-border">
          {(
            [
              ["in", "সাইন ইন"],
              ["up", "নতুন স্টাফ অ্যাকাউন্ট"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key);
                setError(null);
                setMessage(null);
              }}
              className={`px-3 py-2.5 font-display text-sm ${
                tab === key ? "bg-ink text-paper" : "hover:bg-highlight"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4 p-4">
          {tab === "up" && (
            <label className="block">
              <span className="kicker">নাম</span>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="mt-1 h-11 w-full border-[3px] border-border bg-background px-3 outline-none focus:bg-highlight/30"
              />
            </label>
          )}
          <label className="block">
            <span className="kicker">ইমেইল</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 h-11 w-full border-[3px] border-border bg-background px-3 outline-none focus:bg-highlight/30"
            />
          </label>
          <label className="block">
            <span className="kicker">পাসওয়ার্ড</span>
            <input
              type="password"
              autoComplete={tab === "in" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="mt-1 h-11 w-full border-[3px] border-border bg-background px-3 outline-none focus:bg-highlight/30"
            />
          </label>

          {error && (
            <p className="border-[3px] border-border bg-live px-3 py-2 text-sm font-semibold text-accent-foreground">
              {error}
            </p>
          )}
          {message && (
            <p className="border-[3px] border-dashed border-border px-3 py-2 text-sm">{message}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="slab-sm slab-press inline-flex h-11 w-full items-center justify-center gap-2 bg-ink font-display text-paper disabled:opacity-60"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="h-4 w-4 shrink-0" />
            )}
            {tab === "in" ? "প্রবেশ করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>
      </div>

      <p className="mt-6 border-[3px] border-dashed border-border p-4 text-sm text-muted-foreground">
        অ্যাডমিন প্যানেল ও নিউজরুম মনিটর কেবল অনুমোদিত স্টাফ (অ্যাডমিন/সম্পাদক) রোলধারীরা ব্যবহার
        করতে পারবেন। নতুন অ্যাকাউন্টে রোল না থাকলে প্রকাশনার কাজ করা যাবে না।{" "}
        <Link to="/" className="font-semibold underline">
          হোমপেজে ফিরুন
        </Link>
      </p>
    </div>
  );
}
