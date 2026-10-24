"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ErrorNote, Strip } from "@/components/app-shell";
import { TONE_DOT, postJson, toneClass } from "@/lib/client/api";
import type { Post } from "@/lib/types";

export function ToneTag({ post }: { post: Post }) {
  return (
    <span className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft">
      <i className="block size-3 rounded-full" style={{ background: TONE_DOT[toneClass(post.skinTone.depth)] }} />
      {post.skinTone.depth}, {post.skinTone.undertone}
    </span>
  );
}

export function postFrames(p: Post) {
  return [
    p.lookUrl ? { src: p.lookUrl, label: "Look" } : { src: p.asIsUrl, label: "As-is" },
    { src: p.myToneUrl, label: "My tone", me: true },
  ];
}

export function useTry(postId: string) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go() {
    setBusy(true);
    setError(null);
    try {
      const r = await postJson<{ id: string }>(`/api/posts/${postId}/try`);
      router.push(`/s/${r.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start this look.");
      setBusy(false);
    }
  }
  return { busy, error, go };
}

export function PostCard({ post }: { post: Post }) {
  const t = useTry(post.id);
  return (
    <article className="mb-3.5 rounded-[22px] bg-paper p-2.5">
      <Strip mini frames={postFrames(post)} />
      <div className="flex items-center justify-between gap-2.5 px-1 pb-0.5 pt-2.5">
        <div className="min-w-0">
          <a href={`/p/${post.id}`} className="block text-[14.5px] font-bold leading-[1.3] underline-offset-2 hover:underline">
            {post.caption || post.mood}
          </a>
          <ToneTag post={post} />
        </div>
        <button
          type="button"
          onClick={t.go}
          disabled={t.busy}
          className="whitespace-nowrap rounded-xl bg-cherry px-3 py-2.5 text-[13.5px] font-semibold text-white disabled:opacity-60"
        >
          {t.busy ? "Starting…" : "Try This Look"}
        </button>
      </div>
      {t.error && <ErrorNote onRetry={t.go}>{t.error}</ErrorNote>}
    </article>
  );
}
