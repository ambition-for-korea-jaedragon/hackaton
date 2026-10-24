// App-layout shell: full-bleed on phones, centered phone-width frame on larger screens.
// Screens render inside; a screen's bottom action bar should use <ActionBar>.
import Link from "next/link";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh justify-center sm:items-center sm:py-8">
      <div className="relative flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-mirror sm:min-h-0 sm:h-[860px] sm:rounded-[44px] sm:shadow-[var(--shadow-phone)]">
        {children}
      </div>
    </div>
  );
}

export function ScreenBody({ children }: { children: ReactNode }) {
  // pb leaves room for the fixed action bar
  return <main className="flex-1 overflow-y-auto px-5 pb-36 pt-2">{children}</main>;
}

export function ActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-mirror from-70% to-transparent px-5 pb-[max(30px,env(safe-area-inset-bottom))] pt-4">
      {children}
    </div>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={`flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-cta)] bg-cherry text-[17px] font-semibold text-white disabled:bg-[#d9cfde] ${className}`}
    />
  );
}

type BadgeKind = "live" | "sample" | "simulation" | "web";
const BADGE: Record<BadgeKind, { label: string; dot: string }> = {
  live: { label: "Live AI", dot: "bg-live" },
  sample: { label: "Sample", dot: "bg-sample" },
  simulation: { label: "Simulation", dot: "bg-lilac-deep" },
  web: { label: "Web search", dot: "bg-live" },
};

export function Badge({ kind }: { kind: BadgeKind }) {
  const b = BADGE[kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 py-1 text-xs font-semibold">
      <i className={`block size-[7px] rounded-full ${b.dot}`} />
      {b.label}
    </span>
  );
}

// ---- shared screen parts ----

export function TopBar({
  step,
  onBack,
  backHref,
  right,
}: {
  step?: number; // 1..4 progress dots
  onBack?: () => void;
  backHref?: string;
  right?: ReactNode;
}) {
  const backCls =
    "grid size-[34px] place-items-center rounded-full bg-paper text-lg";
  return (
    <header className="flex items-center justify-between px-5 pb-2.5 pt-[max(14px,env(safe-area-inset-top))]">
      {onBack ? (
        <button type="button" onClick={onBack} aria-label="Back" className={backCls}>
          ‹
        </button>
      ) : backHref ? (
        <Link href={backHref} aria-label="Back" className={backCls}>
          ‹
        </Link>
      ) : (
        <Link href="/" className="font-display text-[22px] tracking-[0.2px]">
          muselook
        </Link>
      )}
      {step ? (
        <div className="flex gap-1.5" role="img" aria-label={`Step ${step} of 4`}>
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={`h-[5px] w-[22px] rounded-[3px] ${n <= step ? "bg-ink" : "bg-line"}`} />
          ))}
        </div>
      ) : null}
      {right ?? (onBack || backHref ? <span className="size-[34px]" /> : null)}
    </header>
  );
}

export function SubLink({ href, onClick, children }: { href?: string; onClick?: () => void; children: ReactNode }) {
  const cls = "mt-2.5 block w-full text-center text-sm text-ink-soft underline-offset-2 hover:underline";
  return href ? (
    <Link href={href} className={cls}>
      {children}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function ErrorNote({ children, onRetry, retryLabel = "Try Again" }: { children: ReactNode; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div role="alert" className="mt-4 rounded-2xl border border-cherry/30 bg-white p-4 text-sm leading-snug">
      <p className="text-ink">{children}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="mt-2 font-semibold text-cherry underline underline-offset-2">
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

export function Spinner() {
  return <span aria-hidden className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
}

export type Frame = { src?: string; label: string; me?: boolean; developing?: boolean };

// Photo-booth strip: dark plum card, framed shots with tags.
export function Strip({
  frames,
  footer,
  mini,
  tilt = true,
}: {
  frames: Frame[];
  footer?: string;
  mini?: boolean;
  tilt?: boolean;
}) {
  const cols = frames.length === 3 ? "grid-cols-3" : "grid-cols-2";
  return (
    <div
      className={`grid gap-2 bg-ink ${cols} ${
        mini ? "gap-1.5 rounded-[14px] p-1.5" : "w-full max-w-[330px] rounded-md px-2.5 pb-3.5 pt-2.5 shadow-lg"
      } ${!mini && tilt ? "-rotate-[1.5deg]" : ""}`}
    >
      {frames.map((f) => (
        <div key={f.label} className={`relative aspect-[4/5] overflow-hidden bg-black ${mini ? "rounded-lg" : ""}`}>
          {f.src && !f.developing ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={f.src} alt={`${f.label} preview`} className="size-full object-cover" />
          ) : (
            <div className="grid size-full animate-pulse place-items-center bg-lilac-deep/40 text-center text-[11px] font-semibold text-white">
              Developing…
            </div>
          )}
          <span
            className={`absolute bottom-1.5 left-1.5 rounded-full px-2 py-[3px] text-[11px] font-bold ${
              f.me ? "bg-cherry text-white" : "bg-paper text-ink"
            }`}
          >
            {f.label}
          </span>
        </div>
      ))}
      {footer && !mini ? (
        <div className="col-span-full flex items-baseline justify-between gap-3 px-0.5 pt-0.5 text-[11px] text-[#d9cde0]">
          <b className="shrink-0 font-display text-sm font-normal text-white">muselook</b>
          <span className="min-w-0 truncate text-right">{footer}</span>
        </div>
      ) : null}
    </div>
  );
}
