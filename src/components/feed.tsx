"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErrorNote, ScreenBody, TopBar } from "@/components/app-shell";
import { PostCard } from "@/components/post-parts";
import { TONE_DOT, api, toneClass, type ToneClass } from "@/lib/client/api";
import type { Post } from "@/lib/types";

const FILTERS: { key: "all" | ToneClass; label: string }[] = [
  { key: "all", label: "All tones" },
  { key: "fair", label: "Fair" },
  { key: "medium", label: "Medium" },
  { key: "deep", label: "Deep" },
];

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

  const shown = (posts ?? []).filter((p) => filter === "all" || toneClass(p.skinTone.depth) === filter);
  return (
    <>
      <TopBar
        right={
          <Link href="/" aria-label="Make a new look" className="grid size-[34px] place-items-center rounded-full bg-paper text-lg">
            ＋
          </Link>
        }
      />
      <div className="flex gap-2 overflow-x-auto px-5 pb-2.5" role="group" aria-label="Filter by skin tone">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-[7px] text-[13px] font-semibold ${
              filter === f.key ? "border-ink bg-ink text-white" : "border-line bg-paper"
            }`}
          >
            {f.key !== "all" && <i className="block size-3 rounded-full" style={{ background: TONE_DOT[f.key] }} />}
            {f.label}
          </button>
        ))}
      </div>
      <ScreenBody>
        {posts === null ? (
          <p role="status" className="mt-10 text-center font-display text-xl text-ink-soft">Loading the feed…</p>
        ) : (
          <>
            {error && <ErrorNote onRetry={() => load(cursor)}>{error}</ErrorNote>}
            {shown.map((p) => <PostCard key={p.id} post={p} />)}
            {shown.length === 0 && !error && (
              <div className="mt-6 rounded-[var(--radius-booth)] bg-lilac p-6 text-center">
                <h2 className="font-display text-2xl leading-tight">
                  {filter === "all" ? "No strips yet." : "No strips for this tone yet."}
                </h2>
                <p className="mx-auto mt-2 max-w-[28ch] text-sm text-ink-soft">
                  {filter === "all" ? "Be the first. Copy a look, keep your tone, and post your strip." : "Try another filter, or post one yourself."}
                </p>
                <Link href="/" className="mt-4 inline-block rounded-[var(--radius-cta)] bg-cherry px-5 py-3 font-semibold text-white">
                  Make the first look
                </Link>
              </div>
            )}
            {cursor && (
              <button type="button" disabled={more} onClick={() => load(cursor)} className="mx-auto mt-1 block rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold">
                {more ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </ScreenBody>
    </>
  );
}
