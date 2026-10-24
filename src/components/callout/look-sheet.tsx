"use client";
import { useEffect, useRef } from "react";
import type { LookStep, Product } from "@/lib/types";
import { AREA_LABEL } from "./areas";
import { Dot } from "./sheets";

// Non-modal bottom panel for one analysis step. The zoomed photo stays visible above it;
// the area tabs switch to another part of the look without closing the panel.
export function LookDock({
  steps,
  step,
  product,
  productsPending,
  onSelect,
  onClose,
}: {
  steps: LookStep[];
  step: LookStep;
  product?: Product;
  productsPending: boolean;
  onSelect: (area: LookStep["area"]) => void;
  onClose: () => void;
}) {
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && closeRef.current();
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, []);
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [step.area]);

  return (
    <section
      aria-label={`${AREA_LABEL[step.area]} breakdown`}
      className="absolute inset-x-0 bottom-0 z-40 flex max-h-[50%] flex-col rounded-t-[28px] bg-mirror shadow-[0_-10px_40px_rgba(42,22,48,.28)]"
    >
      <div className="flex flex-none items-center gap-2 px-4 pb-1 pt-3">
        <div role="tablist" aria-label="Look parts" className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {steps.map((st) => (
            <button
              key={st.area}
              role="tab"
              type="button"
              aria-selected={st.area === step.area}
              onClick={() => onSelect(st.area)}
              className={`flex-none rounded-full px-3 py-1.5 text-[13px] font-bold ${st.area === step.area ? "bg-ink text-white" : "border border-line bg-paper text-ink"}`}
            >
              {AREA_LABEL[st.area]}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 flex-none place-items-center rounded-full bg-paper text-lg leading-none">
          ×
        </button>
      </div>
      <div ref={body} className="overflow-y-auto px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-2">
        <h2 className="font-display text-[22px] leading-tight first-letter:uppercase">{step.finish}</h2>
        {product ? (
          <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-line bg-paper p-2.5">
            <span className="size-11 flex-none rounded-xl border border-ink/10" style={{ background: product.hex ?? "var(--color-lilac)" }} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-ink-soft">Product</span>
              <span className="block truncate text-[14px] font-bold">{product.brand} {product.name}</span>
              {product.shadeName && <span className="block truncate text-[12.5px] text-ink-soft">{product.shadeName}</span>}
            </span>
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="flex-none rounded-xl border-2 border-ink px-3 py-2 text-[13px] font-bold">
              View
            </a>
          </div>
        ) : productsPending ? (
          <div className="mt-2.5 flex items-center gap-3 rounded-2xl border border-line bg-paper p-2.5" role="status">
            <span className="size-11 flex-none animate-pulse rounded-xl bg-line" aria-hidden />
            <span className="text-[13px] text-ink-soft">Finding the product…</span>
          </div>
        ) : null}
        {step.colors.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-2" aria-label="Colors used">
            {step.colors.map((c) => (
              <li key={c.hex + c.name} className="flex items-center gap-1.5 rounded-full border border-line bg-paper py-1 pl-1.5 pr-3 text-[13px] font-semibold">
                <Dot hex={c.hex} size={16} />
                {c.name}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">How it&apos;s done</p>
        <p className="mt-0.5 text-[14.5px] leading-snug">{step.technique}</p>
        {step.tips.length > 0 && (
          <>
            <p className="mt-3.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Watch for</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-[14px] leading-snug">
              {step.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </>
        )}
        {step.productHints.length > 0 && (
          <>
            <p className="mt-3.5 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Look for</p>
            <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{step.productHints.join(" · ")}</p>
          </>
        )}
      </div>
    </section>
  );
}
