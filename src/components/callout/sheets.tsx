"use client";
import { useEffect, useRef, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { AREA_LABEL } from "./areas";

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    function key(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeRef.current();
      } else if (e.key === "Tab" && el) {
        const f = [...el.querySelectorAll<HTMLElement>("a[href],button:not([disabled])")];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      prev?.focus?.();
    };
  }, []);
  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[78%] overflow-y-auto rounded-t-[28px] bg-mirror px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_40px_rgba(42,22,48,.25)]"
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-line" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-3 grid size-8 place-items-center rounded-full bg-paper text-lg leading-none"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export function Dot({ hex, size = 12 }: { hex?: string; size?: number }) {
  return <i aria-hidden className="block flex-none rounded-full border border-ink/15" style={{ width: size, height: size, background: hex ?? "var(--color-lilac)" }} />;
}

export function AreaPill({ area }: { area: Product["area"] }) {
  return <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{AREA_LABEL[area]}</span>;
}

export function ProductSheet({ product: p, onClose }: { product: Product; onClose: () => void }) {
  return (
    <Sheet title={`${AREA_LABEL[p.area]}: ${p.name}`} onClose={onClose}>
      <div className="flex items-center gap-3.5 pr-10">
        <div className="size-[72px] flex-none rounded-2xl border border-ink/10" style={{ background: p.hex ?? "var(--color-lilac)" }} aria-hidden />
        <div className="min-w-0">
          <AreaPill area={p.area} />
          <p className="mt-1.5 text-[13px] font-semibold text-ink-soft">{p.brand}</p>
          <h2 className="font-display text-[22px] leading-tight">{p.name}</h2>
        </div>
      </div>
      {p.shadeName && (
        <p className="mt-3 flex items-center gap-2 text-sm font-semibold">
          <Dot hex={p.hex} size={14} /> {p.shadeName}
        </p>
      )}
      <p className="mt-3 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Why it fits</p>
      <p className="mt-0.5 text-[14.5px] leading-snug">{p.why}</p>
      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs text-ink-soft underline underline-offset-2">
        Source
      </a>
      <a
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        data-autofocus
        className="mt-4 flex h-14 w-full items-center justify-center rounded-[var(--radius-cta)] bg-cherry text-[17px] font-semibold text-white"
      >
        Buy now
      </a>
      <button type="button" onClick={onClose} className="mt-2.5 block w-full text-center text-sm text-ink-soft underline-offset-2 hover:underline">
        Back to look
      </button>
    </Sheet>
  );
}

export function ProductList({ products, onPick }: { products: Product[]; onPick: (p: Product) => void }) {
  return (
    <ul className="space-y-2">
      {products.map((p) => (
        <li key={p.area}>
          <button type="button" onClick={() => onPick(p)} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-paper p-3 text-left">
            <span className="size-9 flex-none rounded-[10px] border border-ink/10" style={{ background: p.hex ?? "var(--color-lilac)" }} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-soft">{AREA_LABEL[p.area]}</span>
              <span className="block truncate text-[14px] font-bold">{p.brand} · {p.name}</span>
              {p.shadeName && <span className="block truncate text-[12.5px] text-ink-soft">{p.shadeName}</span>}
            </span>
            <span aria-hidden className="text-ink-soft">›</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function ListSheet({ products, onPick, onClose, badge }: { products: Product[]; onPick: (p: Product) => void; onClose: () => void; badge: ReactNode }) {
  return (
    <Sheet title="All products" onClose={onClose}>
      <h2 className="mb-3 flex items-center gap-2 pr-10 text-[17px] font-bold">All products {badge}</h2>
      <div data-autofocus tabIndex={-1} className="outline-none">
        <ProductList products={products} onPick={onPick} />
      </div>
    </Sheet>
  );
}
