"use client";
// Home: Instagram-style feed. Full-bleed posts with a 2x2 four-image group, bottom tab bar.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorNote } from "@/components/app-shell";
import { PostFourUp, moodLine, useTry } from "@/components/post-parts";
import { TONE_DOT, api, toneClass, type ToneClass } from "@/lib/client/api";
import type { Post } from "@/lib/types";


const FILTERS: { key: "all" | ToneClass; label: string }[] = [
  { key: "all", label: "All tones" },
  { key: "fair", label: "Fair" },
  { key: "medium", label: "Medium" },
  { key: "deep", label: "Deep" },
];

function timeAgo(iso: string) {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export function Feed() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [cursor, setCursor] = useState<string | undefined>();
  const [filter, setFilter] = useState<"all" | ToneClass>("all");
  const [error, setError] = useState<string | null>(null);
  const [more, setMore] = useState(false);

  const load = useCallback(async (c?: string) => {
    setError(null);
    setMore(true);
    try {
      const r = await api<{ posts: Post[]; nextCursor?: string }>(`/api/posts${c ? `?cursor=${encodeURIComponent(c)}` : ""}`);
      setPosts((p) => (c ? [...(p ?? []), ...r.posts] : r.posts));
      setCursor(r.nextCursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load the feed.");
      setPosts((p) => p ?? []);
    }
    setMore(false);
  }, []);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const shown = (posts ?? []).filter((p) => p.mannequinUrl && p.styledUrl).filter((p) => filter === "all" || toneClass(p.skinTone.depth) === filter);

  return (
    <>
      <header className="flex items-center justify-between border-b border-line/70 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))]">
        <Link href="/" className="font-display text-[26px] leading-none tracking-[0.2px]">
          muselook
        </Link>
        <Link href="/new" aria-label="Make a new look" className="grid size-9 place-items-center rounded-[11px] border-2 border-ink text-xl font-bold leading-none">
          +
        </Link>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 pt-1" role="group" aria-label="Filter by skin tone">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-[6px] text-[13px] font-semibold ${
                filter === f.key ? "border-ink bg-ink text-white" : "border-line bg-paper"
              }`}
            >
              {f.key !== "all" && <i className="block size-3 rounded-full" style={{ background: TONE_DOT[f.key] }} />}
              {f.label}
            </button>
          ))}
        </div>

        {posts === null ? (
          <p role="status" className="mt-10 text-center font-display text-xl text-ink-soft">Loading the feed…</p>
        ) : (
          <>
            {error && (
              <div className="px-4">
                <ErrorNote onRetry={() => load(cursor)}>{error}</ErrorNote>
              </div>
            )}
            {shown.map((p) => (
              <FeedPost key={p.id} post={p} />
            ))}
            {shown.length === 0 && !error && (
              <div className="mx-4 mt-4 rounded-[var(--radius-booth)] bg-lilac p-6 text-center">
                <h2 className="font-display text-2xl leading-tight">
                  {filter === "all" ? "No looks yet." : "No looks for this tone yet."}
                </h2>
                <p className="mx-auto mt-2 max-w-[28ch] text-sm text-ink-soft">
                  {filter === "all" ? "Copy a look, keep your tone, and post the first one." : "Try another filter, or post one yourself."}
                </p>
                <Link href="/new" className="mt-4 inline-block rounded-[var(--radius-cta)] bg-cherry px-5 py-3 font-semibold text-white">
                  Make a new look
                </Link>
              </div>
            )}
            {cursor && (
              <button
                type="button"
                disabled={more}
                onClick={() => load(cursor)}
                className="mx-auto my-3 block rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold"
              >
                {more ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </main>

      <TabBar />
    </>
  );
}

function FeedPost({ post }: { post: Post }) {
  const t = useTry(post.id);
  const [copied, setCopied] = useState(false);
  const tone = toneClass(post.skinTone.depth);

  async function share() {
    const url = `${location.origin}/p/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "muselook", text: post.caption || post.mood, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user cancelled */
    }
  }

  return (
    <article className="mb-5">
      <div className="flex items-center gap-2.5 px-4 pb-2.5">
        <span className="rounded-full bg-[conic-gradient(from_200deg,#e0245e,#cfc4f0,#e0245e)] p-[2px]">
          <span className="block size-8 rounded-full border-2 border-mirror" style={{ background: TONE_DOT[tone] }} />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[14px] font-bold first-letter:uppercase">
            {post.skinTone.depth} · {post.skinTone.undertone.toLowerCase()}
          </p>
          <p className="truncate text-[12px] text-ink-soft">{moodLine(post.mood)}</p>
        </div>
        <span className="text-[12px] text-ink-soft">{timeAgo(post.createdAt)}</span>
      </div>

      <div className="px-4">
        <PostFourUp post={post} />
      </div>

      <div className="flex items-center gap-3 px-4 pt-3">
        <button
          type="button"
          onClick={t.go}
          disabled={t.busy}
          className="rounded-xl bg-cherry px-3.5 py-2 text-[13.5px] font-semibold text-white disabled:opacity-60"
        >
          {t.busy ? "Starting…" : "Try This Look"}
        </button>
        <button type="button" onClick={share} className="rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] font-semibold">
          {copied ? "Link copied" : "Share"}
        </button>
      </div>

      <div className="px-4 pt-2 text-[14px] leading-snug">
        {post.caption && <p className="font-bold">{post.caption}</p>}
        {post.products.length > 0 && (
          <Link href={`/p/${post.id}`} className="mt-1 inline-block text-[13.5px] font-semibold text-ink underline-offset-2 hover:underline">
            View {post.products.length} products
          </Link>
        )}
      </div>
      {t.error && (
        <div className="px-4">
          <ErrorNote onRetry={t.go}>{t.error}</ErrorNote>
        </div>
      )}
    </article>
  );
}

function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="absolute inset-x-0 bottom-0 flex items-center justify-around border-t border-line bg-mirror/95 pb-[max(14px,env(safe-area-inset-bottom))] pt-2.5 backdrop-blur"
    >
      <Link href="/" aria-current="page" className="flex flex-col items-center gap-0.5 text-[11px] font-bold">
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden fill="currentColor">
          <path d="M12 3 3 10.2V21h6.5v-6h5v6H21V10.2z" />
        </svg>
        Home
      </Link>
      <Link href="/new" className="flex flex-col items-center gap-0.5 text-[11px] font-semibold text-ink-soft">
        <span className="grid size-7 place-items-center rounded-[9px] bg-cherry text-lg font-bold leading-none text-white">+</span>
        Create
      </Link>
    </nav>
  );
}
