// App-layout shell: full-bleed on phones, centered phone-width frame on larger screens.
// Screens render inside; a screen's bottom action bar should use <ActionBar>.
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
