"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActionBar, Badge, ErrorNote, PrimaryButton, ScreenBody, Spinner, SubLink, TopBar,
} from "@/components/app-shell";
import { Booth } from "@/components/booth";
import { FourUp } from "@/components/four-up";
import { ShareSheet } from "@/components/share-sheet";
import { ProductCards, ProductSkeleton, ProductsBadge, SwatchBand, areaLabel } from "@/components/tone-parts";
import { getSession, imgUrl, postForm, postJson } from "@/lib/client/api";
import { resizeImage } from "@/lib/client/resize";
import { SELFIES } from "@/lib/samples";
import { SampleDock, readSamplePayload } from "@/components/sample-dock";
import type { SessionState } from "@/lib/types";

type Step = "breakdown" | "onme" | "tone";
const STEP_NO: Record<Step, number> = { breakdown: 2, onme: 3, tone: 4 };
const NOTICE = "My selfie is sent to Anthropic and OpenAI to create the preview and kept on this demo server for this session.";

const isPending = (s: SessionState) =>
  s.applyOriginal.status === "pending" || s.applyTranslated.status === "pending" ||
  s.mannequin?.status === "pending" || s.styled?.status === "pending" || s.products?.status === "pending" || s.museProducts?.status === "pending";

export function SessionFlow({ id }: { id: string }) {
  const [s, setS] = useState<SessionState | null>(null);
  const [step, setStep] = useState<Step | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [share, setShare] = useState(false);
  const stepSet = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const next = await getSession(id);
      setS(next);
      setLoadError(null);
      if (!stepSet.current) {
        stepSet.current = true;
        setStep(
          next.translation || next.applyTranslated.status !== "idle"
            ? "tone"
            : next.applyOriginal.status !== "idle"
              ? "onme"
              : "breakdown",
        );
      }
      return next;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't load this session.");
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  const pending = s ? isPending(s) : false;
  useEffect(() => {
    if (!pending) return;
    const t = setInterval(refresh, 2500);
    return () => clearInterval(t);
  }, [pending, refresh]);

  if (!s || !step) {
    return (
      <>
        <TopBar backHref="/" />
        <ScreenBody>
          {loadError ? (
            <ErrorNote onRetry={refresh}>{loadError}</ErrorNote>
          ) : (
            <p role="status" className="mt-10 text-center font-display text-xl text-ink-soft">Loading your look…</p>
          )}
          <SubLink href="/new">Try another look</SubLink>
        </ScreenBody>
      </>
    );
  }
  if (!s.analysis) {
    return (
      <>
        <TopBar backHref="/" />
        <ScreenBody>
          <ErrorNote onRetry={refresh}>This look hasn&apos;t been analyzed yet.</ErrorNote>
        </ScreenBody>
      </>
    );
  }

  const back = step === "onme" ? () => setStep("breakdown") : step === "tone" ? () => setStep("onme") : undefined;
  return (
    <>
      <TopBar step={STEP_NO[step]} onBack={back} backHref={back ? undefined : "/"} />
      {step === "breakdown" && <Breakdown s={s} onNext={() => setStep("onme")} />}
      {step === "onme" && <OnMe s={s} refresh={refresh} onNext={() => setStep("tone")} />}
      {step === "tone" && <MyTone s={s} refresh={refresh} onShare={() => setShare(true)} />}
      {share && <ShareSheet sessionId={id} onClose={() => setShare(false)} />}
    </>
  );
}

function Breakdown({ s, onNext }: { s: SessionState; onNext: () => void }) {
  const a = s.analysis!;
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <ScreenBody>
        <div className="mt-1.5 flex items-center gap-3.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imgUrl(s.id, "look.jpg")} alt="The look you picked" className="aspect-[5/6] w-[84px] flex-none rounded-[14px] object-cover" />
          <div>
            <Badge kind={s.source === "sample" ? "sample" : "live"} />
            <h1 className="mt-2 font-display text-2xl leading-[1.08]">{a.mood}</h1>
          </div>
        </div>
        <ol className="mt-[18px]">
          {a.steps.map((st, i) => (
            <li key={st.area} className="grid grid-cols-[30px_1fr] gap-3 border-t border-line py-[13px] first:border-t-0">
              <span className="grid size-[26px] place-items-center rounded-full bg-ink text-[13px] font-bold text-white">{i + 1}</span>
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold">
                  {areaLabel(st.area)} <em className="text-[13px] font-medium not-italic text-ink-soft">{st.finish}</em>
                  <span className="ml-auto inline-flex gap-1">
                    {st.colors.map((c) => (
                      <i key={c.hex + c.name} title={c.name} role="img" aria-label={`${c.name} ${c.hex}`} className="block size-4 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]" style={{ background: c.hex }} />
                    ))}
                  </span>
                </h2>
                <p className="mt-[3px] text-sm leading-[1.42] text-ink-soft">{st.technique}</p>
                {st.tips.length > 0 && (
                  <>
                    <button
                      type="button"
                      aria-expanded={open === st.area}
                      onClick={() => setOpen(open === st.area ? null : st.area)}
                      className="mt-1.5 text-[13px] font-semibold underline underline-offset-2"
                    >
                      {open === st.area ? "Hide tips" : `Tips (${st.tips.length})`}
                    </button>
                    {open === st.area && (
                      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-snug text-ink-soft">
                        {st.tips.map((t) => <li key={t}>{t}</li>)}
                      </ul>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ol>
      </ScreenBody>
      <ActionBar>
        <PrimaryButton onClick={onNext}>See It On Me</PrimaryButton>
        <SubLink href="/new">Try another look</SubLink>
      </ActionBar>
    </>
  );
}

function OnMe({ s, refresh, onNext }: { s: SessionState; refresh: () => Promise<unknown>; onNext: () => void }) {
  const st = s.applyOriginal.status;
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [over, setOver] = useState(false);
  const [pickedSample, setPickedSample] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function acceptFile(f: File, sampleId: string | null = null) {
    if (!f.type.startsWith("image/")) return setError("Please choose an image file.");
    setError(null);
    setFile(f);
    setPickedSample(sampleId);
    setPreview(URL.createObjectURL(f));
  }
  async function pickSelfie(id: string) {
    const it = SELFIES.find((x) => x.id === id);
    if (!it) return;
    try {
      const blob = await (await fetch(`/samples/${it.file}`)).blob();
      acceptFile(new File([blob], it.file, { type: blob.type || "image/jpeg" }), id);
    } catch {
      setError("Couldn't load that sample. Try uploading a photo instead.");
    }
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await postForm("/api/session/" + s.id + "/selfie", "selfie", await resizeImage(file));
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't upload your selfie.");
    }
    setBusy(false);
  }
  async function translate() {
    setBusy(true);
    setError(null);
    try {
      await postJson("/api/session/" + s.id + "/translate");
      await refresh();
      onNext();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't translate this look.");
    }
    setBusy(false);
  }

  const showForm = st === "idle" || st === "error";
  const selfieSrc = imgUrl(s.id, "selfie.jpg");
  return (
    <>
      <ScreenBody>
        {showForm ? (
          <>
            <SampleDock side="left" kind="selfie" items={SELFIES.slice(0, 4)} title="Try a sample selfie" hint="Synthetic faces for the demo. Drag one onto the photo box, or click it." selected={pickedSample} onPick={(id) => void pickSelfie(id)} />
            <SampleDock side="right" kind="selfie" items={SELFIES.slice(4)} title="More skin tones" selected={pickedSample} onPick={(id) => void pickSelfie(id)} />
            <h1 className="mt-1 font-display text-[28px] leading-[1.05]">Now, your face.</h1>
            <p className="mt-1.5 text-[15px] text-ink-soft">Add a clear, front-facing selfie in good light.</p>
            <div className="mt-3.5 rounded-[28px] bg-lilac p-4">
              <label
                htmlFor="selfie-file"
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
                  if (dropped?.kind === "selfie") void pickSelfie(dropped.id);
                  else if (e.dataTransfer.files[0]) acceptFile(e.dataTransfer.files[0]);
                }}
                className={`relative flex aspect-[4/5] cursor-pointer flex-col [&>*]:pointer-events-none items-center justify-center gap-2 overflow-hidden rounded-[18px] border-2 border-dashed border-ink/30 text-center focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink ${
                  over ? "border-cherry bg-white/60 ring-4 ring-cherry/40" : ""
                }`}
              >
                {over && (
                  <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center bg-white/70 font-display text-2xl">
                    Drop to use this selfie
                  </span>
                )}
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="Your selfie" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <>
                    <span className="grid size-[54px] place-items-center rounded-full bg-paper text-[28px]">+</span>
                    <b className="text-[17px]">Add a selfie</b>
                  </>
                )}
                <input
                  id="selfie-file"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) acceptFile(f);
                  }}
                />
              </label>
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-2.5 text-[13.5px] leading-[1.45] text-ink-soft">
              <input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} className="mt-0.5 size-5 flex-none accent-[#2A1630]" />
              <span>I&apos;m 13 or older. {NOTICE}</span>
            </label>
            <div className="mt-2.5 flex items-start gap-2.5 text-[13.5px] text-ink-soft">
              <Badge kind="simulation" /> <span>Previews are AI-generated and approximate real color.</span>
            </div>
            {st === "error" && <ErrorNote>{s.applyOriginal.error ?? "We couldn't create your preview."} Try the selfie again, or use a different photo.</ErrorNote>}
            {error && <ErrorNote>{error}</ErrorNote>}
          </>
        ) : (
          <>
            <div className="mt-2 rounded-[28px] bg-lilac p-4">
              <Booth
                developing={st === "pending"}
                backdrop={selfieSrc}
                src={imgUrl(s.id, "apply_original.png")}
                alt={st === "pending" ? "Your selfie while the booth develops your photo" : "The look applied to your face, as-is"}
              />
              {st === "pending" ? (
                <div className="mt-3.5 flex items-center gap-2.5 text-[15px] font-semibold" role="status">
                  <span>Developing your photo</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-[3px] bg-ink/10">
                    <i className="block h-full w-1/2 animate-[slide_1.4s_ease-in-out_infinite] rounded-[3px] bg-ink" />
                  </div>
                </div>
              ) : (
                <div className="mt-3.5 flex items-center gap-2 text-sm font-semibold">
                  As-is <Badge kind="simulation" />
                </div>
              )}
            </div>
            <p className="mt-3 text-[13.5px] text-ink-soft">
              {st === "pending" ? "Putting the look on you. This can take up to a minute." : "This is the look exactly as the original wears it. Next, we shift it to your tone."}
            </p>
            {error && <ErrorNote onRetry={translate}>{error}</ErrorNote>}
          </>
        )}
      </ScreenBody>
      <ActionBar>
        {showForm ? (
          <PrimaryButton disabled={!file || !ok || busy} onClick={upload}>
            {busy ? (<><Spinner /> Uploading…</>) : st === "error" ? "Try Again" : "See It On Me"}
          </PrimaryButton>
        ) : st === "pending" ? (
          <PrimaryButton disabled>Putting the look on you…</PrimaryButton>
        ) : (
          <PrimaryButton onClick={translate} disabled={busy}>
            {busy ? (<><Spinner /> Reading your tone…</>) : "Translate To My Tone"}
          </PrimaryButton>
        )}
      </ActionBar>
    </>
  );
}

function MyTone({ s, refresh, onShare }: { s: SessionState; refresh: () => Promise<unknown>; onShare: () => void }) {
  const t = s.translation;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function retry() {
    setBusy(true);
    setError(null);
    try {
      await postJson("/api/session/" + s.id + "/translate");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't translate this look.");
    }
    setBusy(false);
  }

  if (!t) {
    return (
      <>
        <ScreenBody>
          <ErrorNote onRetry={busy ? undefined : retry}>{busy ? "Translating…" : "We don't have your tone translation yet."}</ErrorNote>
          {error && <ErrorNote>{error}</ErrorNote>}
        </ScreenBody>
      </>
    );
  }
  const tp = s.applyTranslated;
  const mn = s.mannequin?.status === "done";
  const sty = s.styled?.status === "done";
  const me = tp.status === "done";
  const done = mn && sty && me;
  const prodPending = !s.products || s.products.status === "pending" || s.products.status === "idle" || s.museProducts?.status === "pending";
  const ready = done && !prodPending;
  const label = `${t.skinTone.depth}, ${t.skinTone.undertone}`;
  const prod = s.products;
  return (
    <>
      <ScreenBody>
        <div className="pt-1">
          <FourUp
            mannequin={mn ? imgUrl(s.id, "mannequin.png") : undefined}
            muse={imgUrl(s.id, "look.jpg")}
            me={me ? imgUrl(s.id, "apply_translated.png") : undefined}
            styled={sty ? imgUrl(s.id, "styled.png") : undefined}
            pending={{ mannequin: !mn, me: !me, styled: !sty }}
          />
        </div>
        {(s.mannequin?.status === "error" || s.styled?.status === "error") && <ErrorNote>We couldn&apos;t finish every photo in your look. Try another look or retry the translation.</ErrorNote>}
        {!done && tp.status !== "error" && <p role="status" className="mt-3 text-center text-sm font-semibold text-ink-soft">Developing your look…</p>}
                {tp.status === "error" && <ErrorNote onRetry={retry}>{tp.error ?? "We couldn't create your My tone photo."}</ErrorNote>}
        {error && <ErrorNote>{error}</ErrorNote>}
        <p className="mt-3 flex items-center gap-2 text-[13px] text-ink-soft"><Badge kind="simulation" /> AI-generated, approximate color.</p>

        <h2 className="mb-2 mt-[18px] flex items-center gap-2 text-[15px] font-bold">
          Shifted for {label} skin <Badge kind="live" />
        </h2>
        <SwatchBand translation={t} />

        <h2 className="mb-2 mt-[18px] flex items-center gap-2 text-[15px] font-bold">
          Products for your shifted look {prod?.status === "done" && <ProductsBadge fallback={prod.fallback} />}
        </h2>
        {!prod || prod.status === "pending" || prod.status === "idle" ? (
          <>
            <ProductSkeleton />
            <p className="mt-2 text-[13px] text-ink-soft">Searching for products that match…</p>
          </>
        ) : prod.status === "error" || !prod.items?.length ? (
          <p className="text-sm text-ink-soft">We couldn&apos;t find products this time. {prod.error ?? ""}</p>
        ) : (
          <ProductCards products={prod.items} />
        )}

        {t.routine.length > 0 && (
          <>
            <h2 className="mb-1 mt-[18px] text-[15px] font-bold">Your routine</h2>
            <ol className="text-sm">
              {t.routine.map((r, i) => (
                <li key={i} className="grid grid-cols-[30px_1fr] gap-3 border-t border-line py-2.5 first:border-t-0">
                  <span className="grid size-[26px] place-items-center rounded-full bg-ink text-[13px] font-bold text-white">{i + 1}</span>
                  <p><b>{areaLabel(r.area)}</b> <span className="text-ink-soft">{r.step}</span></p>
                </li>
              ))}
            </ol>
          </>
        )}
      </ScreenBody>
      <ActionBar>
        <PrimaryButton disabled={!ready} onClick={onShare}>{done && prodPending ? "Finding products…" : "Share My Look"}</PrimaryButton>
        <SubLink href="/new">Try another look</SubLink>
      </ActionBar>
    </>
  );
}
