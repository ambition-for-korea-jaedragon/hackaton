import { Badge } from "@/components/app-shell";
import type { Product, ToneTranslation } from "@/lib/types";

const LABEL: Record<string, string> = { skincare: "Skin prep", base: "Base", eye: "Eyes", blush: "Blush", lip: "Lips" };
export const areaLabel = (a: string) => LABEL[a] ?? a;

// Arm swatch band on the user's own skin colour.
export function SwatchBand({ translation }: { translation: ToneTranslation }) {
  const bg = translation.skinTone.hex;
  const r = parseInt(bg.slice(1, 3), 16), g = parseInt(bg.slice(3, 5), 16), b = parseInt(bg.slice(5, 7), 16);
  const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.62;
  const fg = light ? "#2A1630" : "#FBEDE4";
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl px-3.5 py-3" style={{ background: bg, color: fg }}>
      {translation.changes.map((c) => (
        <div key={c.area} className="grid grid-cols-[44px_14px_44px_1fr] items-center gap-2">
          <div className="h-4 rounded-[12px_18px_14px_20px/10px_12px_10px_12px] shadow-[inset_0_-2px_0_rgba(0,0,0,.08)]" style={{ background: c.fromHex }} role="img" aria-label={`Original ${areaLabel(c.area)} shade ${c.fromHex}`} />
          <span aria-hidden className="text-center text-xs opacity-70">→</span>
          <div className="h-4 rounded-[12px_18px_14px_20px/10px_12px_10px_12px] shadow-[inset_0_-2px_0_rgba(0,0,0,.08)]" style={{ background: c.toHex }} role="img" aria-label={`Shifted ${areaLabel(c.area)} shade ${c.toHex}`} />
          <span className="text-[13px] leading-[1.3]">
            <b className="block text-xs">{areaLabel(c.area)}</b>
            {c.reason}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProductCards({ products }: { products: Product[] }) {
  return (
    <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1">
      {products.map((p, i) => (
        <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="w-[150px] flex-none rounded-2xl border border-line bg-paper p-2.5">
          <div className="mb-2 h-[52px] rounded-[10px] bg-lilac/50" style={p.hex ? { background: p.hex } : undefined} />
          <div className="text-[11.5px] font-semibold text-ink-soft">{p.brand}</div>
          <div className="mt-px text-[13.5px] font-bold leading-tight">
            {p.name}
            {p.shadeName ? ` · ${p.shadeName}` : ""}
          </div>
          <div className="mt-1 text-xs leading-[1.35] text-ink-soft">{p.why}</div>
          <div className="mt-1.5 text-xs font-bold text-cherry">View product<span className="sr-only"> (opens in a new tab)</span></div>
        </a>
      ))}
    </div>
  );
}

export function ProductsBadge({ fallback }: { fallback?: boolean }) {
  return <Badge kind={fallback ? "sample" : "web"} />;
}

export function ProductSkeleton() {
  return (
    <div className="flex gap-2.5" aria-busy="true" aria-label="Searching for products">
      {[0, 1].map((i) => (
        <div key={i} className="w-[150px] flex-none animate-pulse rounded-2xl border border-line bg-paper p-2.5">
          <div className="mb-2 h-[52px] rounded-[10px] bg-line" />
          <div className="h-3 w-1/2 rounded bg-line" />
          <div className="mt-2 h-4 w-5/6 rounded bg-line" />
          <div className="mt-2 h-3 w-full rounded bg-line" />
        </div>
      ))}
    </div>
  );
}
