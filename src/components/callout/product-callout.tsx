"use client";
// Muse photo with pins on face points, corner summary cards + leader lines, zoom/pan focus.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Area, AreaPoints, Product } from "@/lib/types";
import { AREA_LABEL, productTitle } from "./areas";
import { Dot } from "./sheets";

const MAX_K = 4;
const FOCUS_K = 2.4;
const HIDE_CARDS_K = 1.15;
type View = { k: number; tx: number; ty: number };
const HOME: View = { k: 1, tx: 0, ty: 0 };

// card slots: which corner each area's card sits in
const SLOT: Record<Area, "tl" | "tr" | "bl" | "br" | "tc"> = { eye: "tl", blush: "tr", base: "bl", lip: "br", skincare: "tc" };

export function ProductCallout({
  src,
  points,
  products,
  activeArea,
  onPick,
  resetSignal,
}: {
  src: string;
  points?: AreaPoints;
  products: Product[];
  activeArea: Area | null; // product whose sheet is open
  onPick: (p: Product) => void;
  resetSignal: number;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState<View>(HOME);
  const [hover, setHover] = useState<Area | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
  const { w, h } = size;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clamp = useCallback(
    (v: View): View => {
      const k = Math.min(MAX_K, Math.max(1, v.k));
      return { k, tx: Math.min(0, Math.max(w - w * k, v.tx)), ty: Math.min(0, Math.max(h - h * k, v.ty)) };
    },
    [w, h],
  );
  const zoomAt = useCallback(
    (cx: number, cy: number, nk: number) =>
      setView((v) => {
        const k = Math.min(MAX_K, Math.max(1, nk));
        if (k <= 1.001) return HOME;
        const r = k / v.k;
        return clamp({ k, tx: cx - (cx - v.tx) * r, ty: cy - (cy - v.ty) * r });
      }),
    [clamp],
  );

  const focusPoint = useCallback(
    (pt: { x: number; y: number }) => {
      // center slightly above the middle so the bottom sheet does not cover it
      setView(clamp({ k: FOCUS_K, tx: w / 2 - pt.x * w * FOCUS_K, ty: h * 0.36 - pt.y * h * FOCUS_K }));
    },
    [clamp, w, h],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (resetSignal) setView(HOME);
  }, [resetSignal]);

  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  });

  // wheel zoom (non-passive so the page does not scroll while zooming)
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function wheel(e: WheelEvent) {
      if (!el) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, viewRef.current.k * Math.exp(-e.deltaY * 0.0015));
    }
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [zoomAt]);

  const pins = products.flatMap((p) => (points?.[p.area] ? [{ p, pt: points[p.area] }] : []));
  const zoomed = view.k > HIDE_CARDS_K;
  const scr = (pt: { x: number; y: number }) => ({ x: pt.x * w * view.k + view.tx, y: pt.y * h * view.k + view.ty });
  const hi = hover ?? activeArea;

  function pick(p: Product, pt: { x: number; y: number }) {
    focusPoint(pt);
    onPick(p);
  }

  const cardW = Math.max(90, (w - 16 - 16) / 3);
  const cardH = 46;
  function cardPos(slot: (typeof SLOT)[Area]) {
    const top = 8;
    const bottom = h - cardH - 8;
    const left = 8;
    const right = w - cardW - 8;
    const center = (w - cardW) / 2;
    return {
      tl: { x: left, y: top },
      tr: { x: right, y: top },
      bl: { x: left, y: bottom },
      br: { x: right, y: bottom },
      tc: { x: center, y: top },
    }[slot];
  }

  const btn = "grid size-9 place-items-center rounded-full bg-paper/95 text-lg font-bold leading-none text-ink shadow disabled:opacity-40";

  return (
    <div className="rounded-[26px] bg-ink p-1.5">
      <div
        ref={stageRef}
        className="relative aspect-[2/3] w-full select-none overflow-hidden rounded-[20px] bg-ink"
        style={{ touchAction: zoomed ? "none" : "pan-y", cursor: zoomed ? (dragging ? "grabbing" : "grab") : "default" }}
        onDoubleClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          const r = e.currentTarget.getBoundingClientRect();
          if (view.k > 1.05) setView(HOME);
          else zoomAt(e.clientX - r.left, e.clientY - r.top, 2.2);
        }}
        onPointerDown={(e) => {
          if (view.k <= 1 || (e.target as HTMLElement).closest("button")) return;
          drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false };
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setView((v) => clamp({ ...v, tx: d.tx + e.clientX - d.x, ty: d.ty + e.clientY - d.y }));
        }}
        onPointerUp={() => {
          drag.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          drag.current = null;
          setDragging(false);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Muse photo"
          draggable={false}
          className={`absolute left-0 top-0 h-full w-full max-w-none origin-top-left object-cover ${dragging ? "" : "motion-safe:transition-transform motion-safe:duration-300"}`}
          style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${view.k})` }}
        />

        {w > 0 && pins.length > 0 && (
          <>
            {!zoomed && (
              <svg className="pointer-events-none absolute inset-0" width={w} height={h} aria-hidden>
                {pins.map(({ p, pt }) => {
                  const c = cardPos(SLOT[p.area]);
                  const top = SLOT[p.area][0] === "t";
                  const a = { x: c.x + cardW / 2, y: top ? c.y + cardH : c.y };
                  const b = scr(pt);
                  const on = hi === p.area;
                  return (
                    <g key={p.area}>
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#fff" strokeOpacity={0.9} strokeWidth={on ? 3.5 : 2.5} strokeLinecap="round" />
                      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={on ? "#e0245e" : "#2a1630"} strokeWidth={on ? 1.8 : 1} strokeLinecap="round" />
                    </g>
                  );
                })}
              </svg>
            )}

            {!zoomed &&
              pins.map(({ p, pt }) => {
                const c = cardPos(SLOT[p.area]);
                const on = hi === p.area;
                return (
                  <button
                    key={p.area}
                    type="button"
                    onClick={() => pick(p, pt)}
                    onMouseEnter={() => setHover(p.area)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(p.area)}
                    onBlur={() => setHover(null)}
                    aria-label={`${AREA_LABEL[p.area]}: ${p.name}`}
                    className={`absolute rounded-xl border bg-paper p-1.5 text-left shadow-md ${on ? "border-cherry ring-2 ring-cherry/40" : "border-line"}`}
                    style={{ left: c.x, top: c.y, width: cardW, height: cardH }}
                  >
                    <span className="flex items-center gap-1">
                      <span className={`rounded-full px-1.5 text-[9.5px] font-bold uppercase leading-[15px] text-white ${on ? "bg-cherry" : "bg-ink"}`}>{AREA_LABEL[p.area]}</span>
                      <Dot hex={p.hex} size={10} />
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] font-semibold leading-tight">{productTitle(p)}</span>
                  </button>
                );
              })}

            {pins.map(({ p, pt }) => {
              const s = scr(pt);
              const on = hi === p.area;
              return (
                <button
                  key={p.area}
                  type="button"
                  onClick={() => pick(p, pt)}
                  onMouseEnter={() => setHover(p.area)}
                  onMouseLeave={() => setHover(null)}
                  aria-label={`${AREA_LABEL[p.area]}: ${p.name}`}
                  className="group absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-offset-0 focus-visible:outline-2 focus-visible:outline-white"
                  style={{ left: s.x, top: s.y }}
                >
                  <span aria-hidden className={`absolute size-[22px] rounded-full border-2 motion-safe:animate-ping ${on ? "border-cherry" : "border-white"}`} />
                  <span aria-hidden className={`relative size-[14px] rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(42,22,48,.5)] ${on ? "bg-cherry" : "bg-ink"}`} />
                </button>
              );
            })}
          </>
        )}

        <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
          <button type="button" className={btn} aria-label="Zoom in" onClick={() => zoomAt(w / 2, h / 2, view.k * 1.5)} disabled={view.k >= MAX_K}>+</button>
          <button type="button" className={btn} aria-label="Zoom out" onClick={() => zoomAt(w / 2, h / 2, view.k / 1.5)} disabled={view.k <= 1}>−</button>
          <button type="button" className={`${btn} text-[15px]`} aria-label="Reset zoom" onClick={() => setView(HOME)} disabled={view.k <= 1}>⟲</button>
        </div>
      </div>
    </div>
  );
}
