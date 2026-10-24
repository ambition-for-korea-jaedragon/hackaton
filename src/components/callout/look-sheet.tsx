"use client";
import type { LookStep } from "@/lib/types";
import { AREA_LABEL } from "./areas";
import { AreaPill, Dot, Sheet } from "./sheets";

// Detail sheet for one analysis step of the muse look (opened from a pin or the step list).
export function LookStepSheet({ step, onClose }: { step: LookStep; onClose: () => void }) {
  return (
    <Sheet title={`${AREA_LABEL[step.area]} breakdown`} onClose={onClose}>
      <div className="pr-10">
        <AreaPill area={step.area} />
        <h2 className="mt-2 font-display text-[24px] leading-tight first-letter:uppercase">{step.finish}</h2>
      </div>
      {step.colors.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Colors used">
          {step.colors.map((c) => (
            <li key={c.hex + c.name} className="flex items-center gap-1.5 rounded-full border border-line bg-paper py-1 pl-1.5 pr-3 text-[13px] font-semibold">
              <Dot hex={c.hex} size={16} />
              {c.name}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">How it&apos;s done</p>
      <p className="mt-0.5 text-[14.5px] leading-snug">{step.technique}</p>
      {step.tips.length > 0 && (
        <>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Watch for</p>
          <ul className="mt-1 list-disc space-y-1 pl-4 text-[14px] leading-snug">
            {step.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </>
      )}
      {step.productHints.length > 0 && (
        <>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-ink-soft">Look for</p>
          <p className="mt-0.5 text-[14px] leading-snug text-ink-soft">{step.productHints.join(" · ")}</p>
        </>
      )}
      <button
        type="button"
        data-autofocus
        onClick={onClose}
        className="mt-5 flex h-12 w-full items-center justify-center rounded-[var(--radius-cta)] bg-ink text-[16px] font-semibold text-white"
      >
        Back to look
      </button>
    </Sheet>
  );
}
