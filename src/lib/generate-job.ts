import "server-only";
import { readFileFrom, updateSession, writeFileTo, loadSession } from "./storage";
import { trackJob } from "./jobs";
import {
  generateApplied,
  generateFromImages,
  mannequinPrompt,
  originalPrompt,
  recolorPrompt,
  styledPrompt,
  translatedPrompt,
} from "./imagegen";

type Kind = "original" | "translated" | "mannequin" | "styled";
const KEY = { original: "applyOriginal", translated: "applyTranslated", mannequin: "mannequin", styled: "styled" } as const;
const FILE = {
  original: "apply_original.png",
  translated: "apply_translated.png",
  mannequin: "mannequin.png",
  styled: "styled.png",
} as const;

// Fire-and-forget; always settles session status. Caller must NOT await.
export function runGeneration(id: string, kind: Kind): Promise<void> {
  return trackJob(`${id}:${KEY[kind]}`, () => runGenerationInner(id, kind));
}

async function runGenerationInner(id: string, kind: Kind): Promise<void> {
  const key = KEY[kind];
  try {
    const s = await loadSession(id);
    if (!s) throw new Error("missing session");
    const look = await readFileFrom(id, "look.jpg");
    if (!look) throw new Error("missing session inputs");
    let png: Buffer;
    if (kind === "mannequin") {
      png = await generateFromImages([{ buf: look, name: "look.jpg", type: "image/jpeg" }], mannequinPrompt(s.analysis));
    } else if (kind === "styled") {
      const tr = await readFileFrom(id, "apply_translated.png");
      if (!tr || !s.translation) throw new Error("missing translated image");
      const imgs = [
        { buf: tr, name: "base.png", type: "image/png" as const },
        { buf: look, name: "look.jpg", type: "image/jpeg" as const },
      ];
      try {
        png = await generateFromImages(imgs, styledPrompt(s.translation, s.analysis));
      } catch (e) {
        // Safety-filter false positives: retry once with a more conservative prompt.
        if (!/safety/i.test(e instanceof Error ? e.message : "")) throw e;
        png = await generateFromImages(imgs, styledPrompt(s.translation, s.analysis, true));
      }
    } else {
      const selfie = await readFileFrom(id, "selfie.jpg");
      if (!selfie) throw new Error("missing session inputs");
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
    }
    await writeFileTo(id, FILE[kind], png);
    await updateSession(id, (st) => {
      st[key] = { status: "done" };
      if (kind === "translated") st.styled = { status: "pending" };
    });
    if (kind === "translated") void runGeneration(id, "styled");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[generate:${kind}] ${id}: ${msg}`);
    await updateSession(id, (st) => {
      st[key] = { status: "error", error: msg };
    }).catch(() => {});
  }
}
