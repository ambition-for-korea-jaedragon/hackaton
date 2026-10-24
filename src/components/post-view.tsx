"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionBar, Badge, ErrorNote, PrimaryButton, ScreenBody, SubLink, TopBar } from "@/components/app-shell";
import { PostFourUp, ToneTag, useTry } from "@/components/post-parts";
import { ProductCards, ProductsBadge } from "@/components/tone-parts";
import { api, delKey } from "@/lib/client/api";
import { topicLabel } from "@/lib/topics";
import type { Post } from "@/lib/types";

export function PostView({ post }: { post: Post | null }) {
  const router = useRouter();
  const t = useTry(post?.id ?? "");
  const [token, setToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!post) return;
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(localStorage.getItem(delKey(post.id)));
    } catch {}
  }, [post]);

  if (!post) {
    return (
      <>
        <TopBar backHref="/" />
        <ScreenBody>
          <h1 className="mt-8 font-display text-3xl">This post is gone.</h1>
          <p className="mt-2 text-ink-soft">It may have been deleted, or the link is wrong.</p>
          <Link href="/" className="mt-4 inline-block font-semibold underline underline-offset-2">Open the feed</Link>
        </ScreenBody>
      </>
    );
  }

  async function del() {
    if (!post || !token || !confirm("Delete this post? This can't be undone.")) return;
    setDeleting(true);
    setErr(null);
    try {
      await api(`/api/posts/${post.id}`, { method: "DELETE", headers: { "x-delete-token": token } });
      try { localStorage.removeItem(delKey(post.id)); } catch {}
      router.push("/");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't delete this post.");
      setDeleting(false);
    }
  }

  return (
    <>
      <TopBar backHref="/" />
      <ScreenBody>
        <div className="pt-1"><PostFourUp post={post} /></div>
        <h1 className="mt-4 text-[17px] font-bold leading-snug">{post.caption || post.mood}</h1>
        {(post.tags ?? []).length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-sm font-semibold text-cherry">
            {(post.tags ?? []).map((k) => <span key={k}>#{topicLabel(k)}</span>)}
          </p>
        )}
        <div className="flex items-center gap-2"><ToneTag post={post} /><Badge kind="simulation" /></div>
        {post.products.length > 0 && (
          <>
            <h2 className="mb-2 mt-[18px] flex items-center gap-2 text-[15px] font-bold">Products <ProductsBadge /></h2>
            <ProductCards products={post.products} />
          </>
        )}
        {token && (
          <button type="button" onClick={del} disabled={deleting} className="mt-6 text-sm font-semibold text-cherry underline underline-offset-2">
            {deleting ? "Deleting…" : "Delete my post"}
          </button>
        )}
        {err && <ErrorNote>{err}</ErrorNote>}
        {t.error && <ErrorNote onRetry={t.go}>{t.error}</ErrorNote>}
      </ScreenBody>
      <ActionBar>
        <PrimaryButton onClick={t.go} disabled={t.busy}>{t.busy ? "Starting…" : "Try This Look"}</PrimaryButton>
        <SubLink href="/">Back to feed</SubLink>
      </ActionBar>
    </>
  );
}
