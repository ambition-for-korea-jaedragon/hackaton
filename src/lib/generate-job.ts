import "server-only";
import { readFileFrom, updateSession, writeFileTo, loadSession } from "./storage";
import { generateApplied, originalPrompt, translatedPrompt } from "./imagegen";

// Fire-and-forget; always settles session status. Caller must NOT await.
export async function runGeneration(id: string, kind: "original" | "translated"): Promise<void> {
  const key = kind === "original" ? "applyOriginal" : "applyTranslated";
  try {
    const s = await loadSession(id);
    const [selfie, look] = await Promise.all([readFileFrom(id, "selfie.jpg"), readFileFrom(id, "look.jpg")]);
    if (!s || !selfie || !look) throw new Error("missing session inputs");
    const prompt =
      kind === "original"
        ? originalPrompt(s.analysis, s.translation?.skinTone.hex)
        : (() => {
            if (!s.translation) throw new Error("missing translation");
            return translatedPrompt(s.analysis, s.translation);
          })();
    const png = await generateApplied({ selfie, look, prompt });
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
