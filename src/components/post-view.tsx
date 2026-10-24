"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionBar, Badge, ErrorNote, PrimaryButton, ScreenBody, SubLink, TopBar } from "@/components/app-shell";
import { ToneTag, useTry } from "@/components/post-parts";
import { ProductsBadge } from "@/components/tone-parts";
import { api, delKey } from "@/lib/client/api";
import { useFacePoints } from "@/lib/client/face-points";
import { topicLabel } from "@/lib/topics";
import { sortProducts } from "@/components/callout/areas";
import { ProductCallout } from "@/components/callout/product-callout";
import { ListSheet, ProductList, ProductSheet } from "@/components/callout/sheets";
import type { Post, Product } from "@/lib/types";

export function PostView({ post }: { post: Post | null }) {
  const router = useRouter();
  const t = useTry(post?.id ?? "");
  const [token, setToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sel, setSel] = useState<Product | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const points = useFacePoints(post?.lookUrl, post?.points);

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

  const sorted = sortProducts(post.products);
  const sampleOnly = sorted.length > 0 && sorted.every((p) => { try { return new URL(p.url).host === "global.oliveyoung.com"; } catch { return false; } });
  const badge = <ProductsBadge fallback={sampleOnly} />;
  const hasPins = !!post.lookUrl && sorted.some((p) => points?.[p.area]);

  function pickProduct(p: Product) {
    setListOpen(false);
    setSel(p);
  }
  function closeSheets() {
    setSel(null);
    setListOpen(false);
    setResetSignal((n) => n + 1);
  }

  return (
    <>
      <TopBar backHref="/" />
      <ScreenBody>
        {post.lookUrl ? (
          <ProductCallout
            src={post.lookUrl}
            points={points ?? undefined}
            products={sorted}
            activeArea={sel?.area ?? null}
            onPick={pickProduct}
            resetSignal={resetSignal}
          />
        ) : (
          <div className="grid aspect-[2/3] w-full place-items-center rounded-[26px] bg-lilac p-6 text-center">
            <p className="font-display text-2xl">Muse photo hidden</p>
          </div>
        )}
        {post.lookUrl && sorted.length > 0 && !hasPins && (
          <p className="mt-2 text-center text-xs text-ink-soft">Pins aren’t ready for this look. Open All products to see the list.</p>
        )}
        <h1 className="mt-4 text-[17px] font-bold leading-snug">{post.caption || post.mood}</h1>
        {(post.tags ?? []).length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-sm font-semibold text-cherry">
            {(post.tags ?? []).map((k) => <span key={k}>#{topicLabel(k)}</span>)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2"><ToneTag post={post} /><Badge kind="simulation" /></div>
        {!post.lookUrl && (
          <>
            <h2 className="mb-2 mt-[18px] flex items-center gap-2 text-[15px] font-bold">Products {sorted.length > 0 && badge}</h2>
            {sorted.length > 0 ? <ProductList products={sorted} onPick={pickProduct} /> : <p className="text-sm text-ink-soft">No products were found for this look.</p>}
          </>
        )}
        {post.lookUrl && sorted.length === 0 && <p className="mt-4 text-sm text-ink-soft">No products were found for this look.</p>}
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
        {post.lookUrl && sorted.length > 0 ? (
          <SubLink onClick={() => setListOpen(true)}>All products ({sorted.length})</SubLink>
        ) : (
          <SubLink href="/">Back to feed</SubLink>
        )}
      </ActionBar>
      {listOpen && <ListSheet products={sorted} onPick={pickProduct} onClose={closeSheets} badge={badge} />}
      {sel && <ProductSheet product={sel} onClose={closeSheets} />}
    </>
  );
}
