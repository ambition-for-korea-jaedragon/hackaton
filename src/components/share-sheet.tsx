"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ErrorNote, PrimaryButton, Spinner } from "@/components/app-shell";
import { delKey, postJson } from "@/lib/client/api";
import type { Post } from "@/lib/types";

export function ShareSheet({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [caption, setCaption] = useState("");
  const [includeLook, setIncludeLook] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function post() {
    setBusy(true);
    setError(null);
    try {
      const r = await postJson<{ post: Post; deleteToken: string }>("/api/posts", { sessionId, caption, includeLook });
      try {
        localStorage.setItem(delKey(r.post.id), r.deleteToken);
      } catch {}
      setPostId(r.post.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't post your strip.");
    }
    setBusy(false);
  }
  async function copy() {
    const url = `${location.origin}/p/${postId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      setError("Couldn't copy automatically. Copy the link from the post page instead.");
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex items-end bg-ink/45" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-full w-full overflow-y-auto rounded-t-[28px] bg-paper px-5 pb-[30px] pt-2.5 shadow-[0_-10px_30px_rgba(42,22,48,.18)] outline-none"
      >
        <div className="mx-auto mb-3.5 h-[5px] w-10 rounded-[3px] bg-line" />
        {postId ? (
          <>
            <h3 id="share-title" className="mb-1 font-display text-[22px]">Posted to the feed</h3>
            <p className="mb-4 text-sm text-ink-soft">Your strip is live. Share the link or find it at the top of the feed.</p>
            <PrimaryButton onClick={copy}>{copied ? "Link copied" : "Copy link"}</PrimaryButton>
            <div className="mt-3 flex justify-between text-sm font-semibold">
              <Link href={`/p/${postId}`} className="underline underline-offset-2">View your post</Link>
              <Link href="/feed" className="underline underline-offset-2">Open feed</Link>
              <button type="button" onClick={onClose} className="underline underline-offset-2">Close</button>
            </div>
            {error ? <ErrorNote>{error}</ErrorNote> : null}
          </>
        ) : (
          <>
            <h3 id="share-title" className="mb-3 text-[19px] font-bold">Share your strip</h3>
            <label htmlFor="caption" className="sr-only">Caption</label>
            <textarea
              id="caption"
              value={caption}
              maxLength={140}
              rows={2}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              className="w-full resize-none rounded-[14px] border-[1.5px] border-line px-3.5 py-3 text-[15px]"
            />
            <div className="text-right text-xs text-ink-soft">{caption.length}/140</div>
            <div className="mx-0.5 mb-1.5 mt-2 flex items-center justify-between text-[15px] font-medium">
              <span id="look-toggle">Show the original look photo</span>
              <button
                type="button"
                role="switch"
                aria-checked={includeLook}
                aria-labelledby="look-toggle"
                onClick={() => setIncludeLook((v) => !v)}
                className={`relative h-7 w-[46px] rounded-full ${includeLook ? "bg-ink" : "bg-line"}`}
              >
                <i className={`absolute top-[3px] size-[22px] rounded-full bg-white transition-all ${includeLook ? "left-[21px]" : "left-[3px]"}`} />
              </button>
            </div>
            <p className="mx-0.5 mb-4 mt-2 text-[13px] leading-snug text-ink-soft">
              Your strip, tone tag and product list go to the public feed. You can delete it anytime from this device.
            </p>
            <PrimaryButton onClick={post} disabled={busy}>
              {busy ? (<><Spinner /> Posting…</>) : "Post to Feed"}
            </PrimaryButton>
            {error ? <ErrorNote onRetry={post}>{error}</ErrorNote> : null}
            <button type="button" onClick={onClose} className="mt-3 block w-full text-center text-sm text-ink-soft">Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
