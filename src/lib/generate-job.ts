import "server-only";
import { readFileFrom, updateSession, writeFileTo, loadSession } from "./storage";
import { generateApplied, originalPrompt, recolorPrompt, translatedPrompt } from "./imagegen";

// Fire-and-forget; always settles session status. Caller must NOT await.
export async function runGeneration(id: string, kind: "original" | "translated"): Promise<void> {
  const key = kind === "original" ? "applyOriginal" : "applyTranslated";
  try {
    const s = await loadSession(id);
    const [selfie, look] = await Promise.all([readFileFrom(id, "selfie.jpg"), readFileFrom(id, "look.jpg")]);
    if (!s || !selfie || !look) throw new Error("missing session inputs");
    let png: Buffer;
    if (kind === "original") {
      png = await generateApplied({ selfie, look, prompt: originalPrompt(s.analysis, s.translation?.skinTone.hex) });
    } else {
      if (!s.translation) throw new Error("missing translation");
      // Prefer re-coloring the As-is portrait so both frames share pose, light and backdrop; only shades differ.
      const asIs = await readFileFrom(id, "apply_original.png");
      png = asIs
        ? await generateApplied({ selfie: asIs, selfieType: "image/png", look, prompt: recolorPrompt(s.translation) })
        : await generateApplied({ selfie, look, prompt: translatedPrompt(s.analysis, s.translation) });
    }
    await writeFileTo(id, kind === "original" ? "apply_original.png" : "apply_translated.png", png);
    await updateSession(id, (st) => {
      st[key] = { status: "done" };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[generate:${kind}] ${id}: ${msg}`);
    await updateSession(id, (st) => {
      st[key] = { status: "error", error: msg };
    }).catch(() => {});
  }
}
