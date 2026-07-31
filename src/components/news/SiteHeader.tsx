import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Sun, Moon, Eye, Radio, CloudSun, Menu, X } from "lucide-react";
import { articlesQuery, categoriesQuery, bnDate, toBn } from "@/lib/news";

type Mode = "light" | "dark" | "care";

function applyMode(mode: Mode) {
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.style.filter = mode === "care" ? "sepia(0.28) contrast(0.95) brightness(0.97)" : "";
  localStorage.setItem("bv-mode", mode);
}

export function SiteHeader() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("light");
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState("");
  const { data: categories = [] } = useQuery(categoriesQuery);
  const { data: articles = [] } = useQuery(articlesQuery);

  useEffect(() => {
    const saved = (localStorage.getItem("bv-mode") as Mode | null) ?? "light";
    setMode(saved);
    applyMode(saved);
    setToday(bnDate());
  }, []);

  const cycle = () => {
    const next: Mode = mode === "light" ? "dark" : mode === "dark" ? "care" : "light";
    setMode(next);
    applyMode(next);
  };

  const breaking = articles.filter((a) => a.is_breaking);
  const ticker = (breaking.length ? breaking : articles.slice(0, 6)).map((a) => a.title);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim()) return;
    navigate({ to: "/search", search: { q: term.trim() } });
    setOpen(false);
  };

  return (
    <header className="border-b-[3px] border-border bg-card">
      {/* utility strip: date + weather + automation badge */}
      <div className="border-b-[3px] border-border bg-ink text-paper">
        <div className="mx-auto grid max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-1.5 sm:flex sm:justify-between">
          <p className="truncate text-[0.72rem]">{today}</p>
          <div className="flex shrink-0 items-center gap-3 text-[0.72rem]">
            <span className="inline-flex items-center gap-1">
              <CloudSun className="h-3.5 w-3.5 shrink-0" /> ঢাকা {toBn(31)}°সে
            </span>
            <span className="inline-flex items-center gap-1 bg-live px-1.5 py-0.5 font-bold">
              <Radio className="h-3 w-3 shrink-0 animate-pulse" /> ২৪/৭ এআই অটোমেশন সক্রিয়
            </span>
          </div>
        </div>
      </div>

      {/* masthead */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center border-[3px] border-border bg-live font-display text-xl text-accent-foreground shadow-[3px_3px_0_0_var(--color-border)]">
            বা
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-2xl leading-none sm:text-3xl">
              বাংলার ভয়েস
            </span>
            <span className="kicker block text-muted-foreground">World News · AI Newsroom</span>
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <form onSubmit={submit} className="hidden items-center md:flex">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="খবর খুঁজুন..."
              aria-label="খবর খুঁজুন"
              className="h-10 w-52 border-[3px] border-border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:bg-highlight/30"
            />
            <button
              type="submit"
              className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-l-0 border-border bg-ink text-paper"
              aria-label="সার্চ"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
          <button
            onClick={cycle}
            className="slab-sm slab-press grid h-10 w-10 place-items-center"
            aria-label="ডার্ক মোড / আই-প্রোটেকশন টগল"
            title={mode === "light" ? "ডার্ক মোড" : mode === "dark" ? "আই-প্রোটেকশন" : "লাইট মোড"}
          >
            {mode === "light" ? (
              <Moon className="h-4 w-4" />
            ) : mode === "dark" ? (
              <Eye className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            className="slab-sm slab-press grid h-10 w-10 place-items-center md:hidden"
            aria-label="মেনু"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* category nav */}
      <nav
        className={`border-t-[3px] border-border bg-background ${open ? "block" : "hidden md:block"}`}
      >
        <div className="mx-auto flex max-w-[1400px] flex-col gap-0 px-4 md:flex-row md:flex-wrap md:items-center">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              onClick={() => setOpen(false)}
              activeProps={{ className: "bg-ink text-paper" }}
              className="border-b-[2px] border-dashed border-border px-3 py-2.5 font-display text-sm hover:bg-highlight md:border-b-0 md:border-r-[3px] md:border-solid"
            >
              {c.name}
            </Link>
          ))}
          <Link
            to="/learning"
            onClick={() => setOpen(false)}
            className="border-b-[2px] border-dashed border-border px-3 py-2.5 font-display text-sm hover:bg-highlight md:border-b-0 md:border-r-[3px] md:border-solid"
          >
            লার্নিং হাব
          </Link>
          <Link
            to="/newsroom"
            onClick={() => setOpen(false)}
            className="px-3 py-2.5 font-display text-sm hover:bg-highlight"
          >
            নিউজরুম মনিটর
          </Link>
          <form onSubmit={submit} className="flex py-2 md:hidden">
            <input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="খবর খুঁজুন..."
              aria-label="খবর খুঁজুন"
              className="h-10 min-w-0 flex-1 border-[3px] border-border bg-background px-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="grid h-10 w-10 shrink-0 place-items-center border-[3px] border-l-0 border-border bg-ink text-paper"
              aria-label="সার্চ"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </nav>

      {/* breaking ticker */}
      <div className="flex items-stretch border-t-[3px] border-border bg-live text-accent-foreground">
        <span className="kicker grid shrink-0 place-items-center border-r-[3px] border-border bg-ink px-3 text-paper">
          ব্রেকিং
        </span>
        <div className="relative flex-1 overflow-hidden py-2">
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap pl-4 text-sm font-semibold">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i}>◆ {t}</span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}