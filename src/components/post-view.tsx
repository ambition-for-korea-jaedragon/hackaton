"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ActionBar, Badge, ErrorNote, PrimaryButton, ScreenBody, SubLink, TopBar } from "@/components/app-shell";
import { ToneTag, useTry } from "@/components/post-parts";
import { ProductsBadge } from "@/components/tone-parts";
import { api, delKey } from "@/lib/client/api";
import { useFacePoints } from "@/lib/client/face-points";
import { topicLabel } from "@/lib/topics";
import { sortProducts } from "@/components/callout/areas";
import { ProductCallout } from "@/components/callout/product-callout";
import { ListSheet, ProductSheet } from "@/components/callout/sheets";
import type { Post, Product } from "@/lib/types";

type Tab = "muse" | "tone";

function TabSwitch({ tab, onTab, museDisabled }: { tab: Tab; onTab: (t: Tab) => void; museDisabled: boolean }) {
  const items: { id: Tab; label: string; disabled?: boolean }[] = [
    { id: "muse", label: "Muse", disabled: museDisabled },
    { id: "tone", label: "My tone" },
  ];
  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const next = tab === "muse" ? "tone" : "muse";
    if (next === "muse" && museDisabled) return;
    e.preventDefault();
    onTab(next);
    (e.currentTarget.querySelector(`[data-tab="${next}"]`) as HTMLElement | null)?.focus();
  }
  return (
    <div role="tablist" aria-label="Product view" onKeyDown={onKey} className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-lilac/60 p-1">
      {items.map((it) => {
        const on = tab === it.id;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            data-tab={it.id}
            aria-selected={on}
            aria-disabled={it.disabled || undefined}
            disabled={it.disabled}
            tabIndex={on ? 0 : -1}
            title={it.disabled ? "Muse photo hidden" : undefined}
            aria-label={it.disabled ? `${it.label} (Muse photo hidden)` : undefined}
            onClick={() => onTab(it.id)}
            className={`h-10 rounded-full text-sm font-bold transition-colors ${on ? "bg-ink text-white" : "text-ink"} ${it.disabled ? "cursor-not-allowed opacity-45" : ""}`}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

export function PostView({ post }: { post: Post | null }) {
  const router = useRouter();
  const t = useTry(post?.id ?? "");
  const [token, setToken] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sel, setSel] = useState<Product | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const search = useSearchParams();
  const hasMuse = !!post?.lookUrl;
  const override = search.get("tab");
  const [tabState, setTabState] = useState<Tab>(
    override === "tone" ? "tone" : override === "muse" ? "muse" : hasMuse && post?.museProducts?.length ? "muse" : "tone",
  );
  const tab: Tab = hasMuse ? tabState : "tone";
  const musePoints = useFacePoints(post?.lookUrl, post?.points);
  const tonePoints = useFacePoints(post?.myToneUrl);

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

  const isMuse = tab === "muse";
  const sorted = sortProducts((isMuse ? post.museProducts : post.products) ?? []);
  const sampleOnly = sorted.length > 0 && sorted.every((p) => { try { return new URL(p.url).host === "global.oliveyoung.com"; } catch { return false; } });
  const badge = <ProductsBadge fallback={sampleOnly} />;
  const stageSrc = isMuse ? post.lookUrl : post.myToneUrl;
  const points = isMuse ? musePoints : tonePoints;
  const hasPins = sorted.some((p) => points?.[p.area]);
  const heading = isMuse ? "Muse look products" : "Products for my tone";

  function switchTab(next: Tab) {
    if (next === tab) return;
    setSel(null);
    setListOpen(false);
    setResetSignal((n) => n + 1);
    setTabState(next);
  }
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
        <TabSwitch tab={tab} onTab={switchTab} museDisabled={!hasMuse} />
        {stageSrc && (
          <ProductCallout
            key={tab}
            src={stageSrc}
            points={points ?? undefined}
            products={sorted}
            activeArea={sel?.area ?? null}
            onPick={pickProduct}
            resetSignal={resetSignal}
          />
        )}
        {isMuse && sorted.length === 0 && <p className="mt-2 text-center text-xs text-ink-soft">Muse products aren&apos;t available for this post yet.</p>}
        {!isMuse && sorted.length === 0 && <p className="mt-2 text-center text-xs text-ink-soft">No products were found for this look.</p>}
        {sorted.length > 0 && !hasPins && (
          <p className="mt-2 text-center text-xs text-ink-soft">Pins aren’t ready for this look. Open All products to see the list.</p>
        )}
        <h1 className="mt-4 text-[17px] font-bold leading-snug">{post.caption || post.mood}</h1>
        {(post.tags ?? []).length > 0 && (
          <p className="mt-1 flex flex-wrap gap-x-2 text-sm font-semibold text-cherry">
            {(post.tags ?? []).map((k) => <span key={k}>#{topicLabel(k)}</span>)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2"><ToneTag post={post} /><Badge kind="simulation" /></div>
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
        {sorted.length > 0 ? (
          <SubLink onClick={() => setListOpen(true)}>All products ({sorted.length})</SubLink>
        ) : (
          <SubLink href="/">Back to feed</SubLink>
        )}
      </ActionBar>
      {listOpen && <ListSheet products={sorted} onPick={pickProduct} onClose={closeSheets} badge={badge} heading={heading} />}
      {sel && <ProductSheet product={sel} onClose={closeSheets} whyLabel={isMuse ? "Matches the muse" : "Why it fits you"} />}
    </>
  );
}
