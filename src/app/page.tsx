// Setup placeholder for screen 1 (Look). Real flow is built in /dispatch.
import { ActionBar, PrimaryButton, ScreenBody } from "@/components/app-shell";

export default function Home() {
  return (
    <>
      <header className="flex items-center justify-between px-5 pb-2.5 pt-[max(14px,env(safe-area-inset-top))]">
        <span className="font-display text-[22px]">muselook</span>
      </header>
      <ScreenBody>
        <h1 className="mb-2.5 mt-2.5 font-display text-[40px] leading-[1.02] tracking-[-0.3px]">
          Copy the look.
          <br />
          Keep your tone.
        </h1>
        <p className="max-w-[30ch] text-base leading-[1.45] text-ink-soft">
          Drop in any idol or influencer makeup photo. We&apos;ll break it down, put it on your face,
          then shift every shade to suit your skin.
        </p>
        <div className="mt-5 rounded-[var(--radius-booth)] bg-lilac p-3.5">
          <div className="flex h-[250px] flex-col items-center justify-center gap-2.5 rounded-[18px] border-2 border-dashed border-ink/30 text-center">
            <b className="text-[17px]">Add a makeup photo</b>
            <small className="max-w-[26ch] text-[13px] leading-snug text-ink-soft">
              Setup check: design tokens, fonts and app shell are live.
            </small>
          </div>
        </div>
      </ScreenBody>
      <ActionBar>
        <PrimaryButton disabled>Analyze This Look</PrimaryButton>
      </ActionBar>
    </>
  );
}
