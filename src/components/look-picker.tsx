"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActionBar, ErrorNote, PrimaryButton, ScreenBody, Spinner, TopBar } from "@/components/app-shell";
import { api, postJson } from "@/lib/client/api";
import { resizeImage } from "@/lib/client/resize";
import { SAMPLES } from "@/lib/samples";
import { SampleDock, readSamplePayload } from "@/components/sample-dock";

const COPY = ["Reading the look…", "Spotting every shade…", "Matching finishes…", "Writing your breakdown…"];

export function LookPicker() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [sample, setSample] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyIdx, setCopyIdx] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setCopyIdx((i) => Math.min(i + 1, COPY.length - 1)), sample ? 900 : 3000);
    return () => clearInterval(t);
  }, [busy, sample]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function pickFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Please choose an image file.");
    setError(null);
    setFile(f);
    setSample(null);
    setPreview(URL.createObjectURL(f));
  }
  function pickSample(id: string) {
    setSample(id);
    setFile(null);
    setPreview(null);
    setError(null);
  }

  async function analyze() {
    setBusy(true);
    setError(null);
    setCopyIdx(0);
    try {
      let res: { id: string };
      if (sample) {
        // Sample analyses are precomputed and return instantly; hold the analysis scene so the demo shows the step.
        [res] = await Promise.all([
          postJson<{ id: string }>("/api/session/sample", { sampleId: sample }),
          new Promise((r) => setTimeout(r, 3600)),
        ]);
      }
      else if (file) {
        const small = await resizeImage(file);
        const fd = new FormData();
        fd.append("look", small);
        res = await api<{ id: string }>("/api/session", { method: "POST", body: fd });
      } else return;
      router.push(`/s/${res.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't analyze that look.");
      setBusy(false);
    }
  }

  const ready = !!(file || sample);
  const current = SAMPLES.find((s) => s.id === sample);

  const half = Math.ceil(SAMPLES.length / 2);
  return (
    <>
      {!busy && (
        <>
          <SampleDock side="left" kind="look" items={SAMPLES.slice(0, half)} title="Try a sample look" hint="Drag a photo onto the box, or click it." selected={sample} onPick={pickSample} />
          <SampleDock side="right" kind="look" items={SAMPLES.slice(half)} title="More looks" selected={sample} onPick={pickSample} />
        </>
      )}
      <TopBar
        step={1}
        right={
          <Link href="/" aria-label="Close" className="grid size-[34px] place-items-center rounded-full bg-paper text-lg">
            ✕
          </Link>
        }
      />
      <ScreenBody>
        {busy ? (
          <div className="mt-2 rounded-[28px] bg-lilac p-4" role="status" aria-live="polite">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview ?? (current ? `/samples/${current.file}` : "")}
                alt="Your look being analyzed"
                className="size-full object-cover opacity-90"
              />
              <div className="absolute inset-x-0 top-0 h-1/3 animate-[scan_2.2s_ease-in-out_infinite] bg-gradient-to-b from-white/0 via-white/70 to-white/0" />
            </div>
            <div className="mt-3.5 flex items-center gap-2.5 text-[15px] font-semibold">
              <span>{COPY[copyIdx]}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-ink/10">
                <i className="block h-full w-1/2 animate-[slide_1.4s_ease-in-out_infinite] rounded-[3px] bg-ink" />
              </div>
            </div>
            <p className="mt-1 text-[13px] text-ink-soft">
              {sample ? "Sample look: its breakdown was prepared ahead of time." : "This takes about 10 seconds."}
            </p>
          </div>
        ) : (
          <>
            <h1 className="mb-2.5 mt-2.5 font-display text-[40px] leading-[1.02] tracking-[-0.3px]">
              Copy the look.
              <br />
              Keep your tone.
            </h1>
            <p className="max-w-[30ch] text-base leading-[1.45] text-ink-soft">
              Drop in any idol or influencer makeup photo. We&apos;ll break it down, put it on your face, then shift
              every shade to suit your skin.
            </p>
            <div className="mt-5 rounded-[var(--radius-booth)] bg-lilac p-3.5">
              <label
                htmlFor="look-file"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                  setOver(true);
                }}
                onDragLeave={() => setOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setOver(false);
                  const dropped = readSamplePayload(e);
                  if (dropped?.kind === "look") pickSample(dropped.id);
                  else pickFile(e.dataTransfer.files[0]);
                }}
                className={`relative flex h-[250px] cursor-pointer flex-col [&>*]:pointer-events-none items-center justify-center gap-2.5 overflow-hidden rounded-[18px] border-2 border-dashed border-ink/30 text-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                  over ? "border-cherry bg-white/60 ring-4 ring-cherry/40" : ""
                }`}
              >
                {over && (
                  <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-white/70 font-display text-2xl">
                    Drop to use this look
                  </span>
                )}
                {preview || current ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview ?? `/samples/${current?.file}`}
                      alt={current && !preview ? `${current.name} sample look` : "Your selected look"}
                      className="absolute inset-0 size-full object-cover"
                    />
                    <span className="absolute bottom-2.5 rounded-full bg-paper px-3 py-1.5 text-[13px] font-semibold">
                      Change photo
                    </span>
                  </>
                ) : (
                  <>
                    <span className="grid size-[54px] place-items-center rounded-full bg-paper text-[28px]">+</span>
                    <b className="text-[17px]">Add a makeup photo</b>
                    <small className="max-w-[26ch] text-[13px] leading-snug text-ink-soft">
                      A clear, front-facing shot works best. Use photos you have the right to share.
                    </small>
                  </>
                )}
                <input
                  id="look-file"
                  ref={input}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pickFile(e.target.files?.[0])}
                />
              </label>
            </div>
            <div className="mb-2.5 mt-[22px] text-sm font-semibold" id="samples-label">
              Or start with a sample look
            </div>
            <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none]" role="radiogroup" aria-labelledby="samples-label">
              {SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={sample === s.id}
                  onClick={() => pickSample(s.id)}
                  className={`w-[104px] shrink-0 overflow-hidden rounded-2xl bg-paper px-1.5 pb-2 pt-1.5 text-left ${
                    sample === s.id ? "outline outline-[2.5px] outline-ink" : ""
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/samples/${s.file}`}
                    alt={`${s.name} sample look`}
                    className="aspect-[5/6] w-full rounded-[11px] object-cover"
                  />
                  <p className="mx-0.5 mt-[7px] truncate text-[12.5px] font-semibold">{s.name}</p>
                </button>
              ))}
            </div>
            {error ? <ErrorNote onRetry={ready ? analyze : undefined}>{error}</ErrorNote> : null}
          </>
        )}
      </ScreenBody>
      <ActionBar>
        <PrimaryButton disabled={!ready || busy} onClick={analyze}>
          {busy ? (
            <>
              <Spinner /> Analyzing…
            </>
          ) : (
            "Analyze This Look"
          )}
        </PrimaryButton>
      </ActionBar>
    </>
  );
}
