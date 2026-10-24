import "server-only";
import OpenAI, { toFile } from "openai";
import type { LookAnalysis, ToneTranslation } from "./types";

const MODEL = "gpt-image-2.5-sunburst";

function client() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey, timeout: 120_000, maxRetries: 0 });
}

const BASE_RULES =
  "Image 1 is the user's selfie; image 2 is a reference makeup look photo. Create a polished, flattering K-beauty portrait of the SAME person from image 1. " +
  "Identity is sacred: keep the exact face shape, facial features, eye shape, hair texture and TRUE skin tone and undertone from image 1. Never lighten, whiten, smooth away or recolor the skin, and never borrow the face of the person in image 2. " +
  "Style the photo like image 2: soft diffused beauty lighting, a clean backdrop in the same color family as image 2, the same framing (front-facing, shoulders up), neat hair, healthy skin glow and the makeup's finish and texture (dewy, matte, glassy etc.). " +
  "The makeup should look professionally applied, blended and wearable: pretty and natural on this person, not costume-like or overdone. Photorealistic, high detail, no text.";

export function originalPrompt(analysis: LookAnalysis | undefined, skinHex?: string): string {
  const steps = (analysis?.steps ?? [])
    .map((s) => `${s.area}: ${s.colors.map((c) => `${c.name} ${c.hex}`).join(", ") || "-"}; finish ${s.finish}; ${s.technique}`)
    .join("\n");
  return `${BASE_RULES}${skinHex ? ` The person's skin tone is about ${skinHex}; keep it exactly.` : ""}
Apply the makeup from image 2 using the reference's ORIGINAL colors, exactly as the idol wears them, so we can see how the original shades sit on this skin tone.
Look mood: ${analysis?.mood ?? "same as reference"}
${steps}`;
}

export function translatedPrompt(analysis: LookAnalysis | undefined, t: ToneTranslation): string {
  const changes = t.changes
    .map((c) => `- ${c.area}: ${c.toHex} (reference used ${c.fromHex}) — ${c.reason}`)
    .join("\n");
  return `${BASE_RULES} The person's skin tone is ${t.skinTone.depth}, ${t.skinTone.undertone} undertone, about ${t.skinTone.hex}; keep it exactly.
Recreate the same look, same placement, technique, finish and photo styling, but with shades adapted to this skin tone so the look is at its most flattering on her:
${changes}
The adapted colors should read clearly on this skin while staying harmonious and beautiful. Same pose, framing, lighting and backdrop as a plain re-shoot of the same look, so only the shades differ.
Look mood: ${analysis?.mood ?? "same as reference"}.`;
}

export function recolorPrompt(t: ToneTranslation): string {
  const changes = t.changes
    .map((c) => `- ${c.area}: change to ${c.toHex} (was ${c.fromHex}) — ${c.reason}`)
    .join("\n");
  return `Image 1 is a finished makeup portrait; image 2 is the original reference look (for finish and placement only).
Edit image 1 by changing ONLY the makeup shades to versions adapted to her ${t.skinTone.depth}, ${t.skinTone.undertone} skin (about ${t.skinTone.hex}):
${changes}
Keep everything else in image 1 identical: same person, face, skin tone and texture, hair, pose, framing, lighting, backdrop and makeup placement and finish. The new shades should look beautiful, harmonious and clearly visible on her skin, professionally blended. Photorealistic, no text.`;
}

export async function generateApplied(opts: {
  selfie: Buffer;
  selfieType?: "image/jpeg" | "image/png";
  look: Buffer;
  prompt: string;
}): Promise<Buffer> {
  const c = client();
  const res = await c.images.edit({
    model: MODEL,
    image: [
      await toFile(opts.selfie, opts.selfieType === "image/png" ? "base.png" : "selfie.jpg", { type: opts.selfieType ?? "image/jpeg" }),
      await toFile(opts.look, "look.jpg", { type: "image/jpeg" }),
    ],
    prompt: opts.prompt,
    size: "auto",
    quality: "high",
    output_format: "png",
    n: 1,
    // input_fidelity omitted: not supported on gpt-image-2.x models.
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("OpenAI image edit returned no image");
  return Buffer.from(b64, "base64");
}
