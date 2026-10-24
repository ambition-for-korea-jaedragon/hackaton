"use client";
// Desktop-only sample dock: draggable sample photos placed in the empty margins beside the phone frame.
// Drag one onto the photo box (or click it) to use it. Hidden on narrow screens (the in-frame picker is used there).
import { useState } from "react";

export const DND_MIME = "application/x-muselook-sample";
export type SamplePayload = { kind: "look" | "testlook" | "selfie"; id: string };

export function readSamplePayload(e: React.DragEvent): SamplePayload | null {
  try {
    const raw = e.dataTransfer.getData(DND_MIME);
    return raw ? (JSON.parse(raw) as SamplePayload) : null;
  } catch {
    return null;
  }
}

export function hasSamplePayload(e: React.DragEvent) {
  return Array.from(e.dataTransfer.types).includes(DND_MIME);
}

type Item = { id: string; name: string; src: string };

export function SampleDock({
  side,
  kind,
  items,
  title,
  hint,
  selected,
  onPick,
}: {
  side: "left" | "right";
  kind: SamplePayload["kind"];
  items: readonly Item[];
  title: string;
  hint?: string;
  selected?: string | null;
  onPick: (id: string) => void;
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  return (
    <aside
      aria-label={title}
      className={`fixed top-1/2 z-10 hidden max-h-[92vh] w-[250px] -translate-y-1/2 flex-col gap-3 overflow-y-auto p-1 lg:flex xl:w-[290px] ${
        side === "left" ? "right-[calc(50%+250px)] items-end text-right" : "left-[calc(50%+250px)] items-start text-left"
      }`}
    >
      <div>
        <h2 className="font-display text-[22px] leading-tight">{title}</h2>
        {hint && <p className="mt-1 max-w-[24ch] text-[13px] leading-snug text-ink-soft">{hint}</p>}
      </div>
      <ul className="grid w-full grid-cols-2 gap-2.5">
        {items.map((it) => (
          <li key={it.id}>
            <button
              type="button"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DND_MIME, JSON.stringify({ kind, id: it.id } satisfies SamplePayload));
                e.dataTransfer.effectAllowed = "copy";
                setDragging(it.id);
              }}
              onDragEnd={() => setDragging(null)}
              onClick={() => onPick(it.id)}
              aria-label={`Use ${it.name}`}
              className={`group block w-full cursor-grab overflow-hidden rounded-2xl bg-paper p-1.5 text-left shadow-[0_2px_10px_rgba(42,22,48,.08)] transition-transform active:cursor-grabbing motion-safe:hover:-translate-y-0.5 ${
                selected === it.id ? "outline outline-[2.5px] outline-ink" : ""
              } ${dragging === it.id ? "opacity-50" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.src} alt="" draggable={false} className="aspect-[4/5] w-full rounded-[11px] object-cover object-top" />
              <span className="mx-0.5 mt-1.5 block truncate text-[12.5px] font-semibold">{it.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
