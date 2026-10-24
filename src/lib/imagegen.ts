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

export function mannequinPrompt(a: LookAnalysis | undefined): string {
  const steps = a?.steps ?? [];
  return `Image 1 is a reference makeup look. Create a clean studio product-style render of ONLY the makeup, on a completely featureless bald mannequin head: smooth matte white-ivory porcelain, NO hair, NO wig, NO ears, NO eyebrows, NO eyelashes, NO personality. The face is a minimal sculpted form (only the soft shape of the eye sockets, nose bridge and lips needed to carry makeup), like a cosmetics-counter display head. Head and neck only, front-facing, tightly framed, centered, on a plain seamless light neutral-gray backdrop with soft even studio light. Paint ONLY the makeup from image 1 onto it, with the reference's exact original colors, placement and finishes, so that the makeup itself is the only thing that stands out: ${steps
    .filter((s) => s.area !== "skincare")
    .map((s) => `${s.area}: ${s.colors.map((x) => `${x.name} ${x.hex}`).join(", ")}, ${s.finish}`)
    .join("; ")}. Photorealistic, no text.`;
}

export function styledPrompt(t: ToneTranslation, a: LookAnalysis | undefined, safe = false): string {
  const makeup = t.changes.map((c) => `${c.area} ${c.toHex}`).join(", ");
  return `Image 1 is a photo of the user wearing finished makeup; image 2 is a reference look photo (the muse).
Create a slightly wider, further-away photo of the SAME person from image 1 (chest-up or waist-up, with some distance, still flattering and front-facing), keeping her face, identity, hair texture and TRUE skin tone (${t.skinTone.depth}, ${t.skinTone.undertone} undertone, about ${t.skinTone.hex}) exactly, and the SAME makeup with the exact same colors as image 1 (${makeup}). Do not lighten, smooth away or recolor her skin, and never borrow the face of the person in image 2.
Now show the styling inspired by image 2: hair styling, plus accessories such as earrings, necklace and hair accessories, and a fashionable fully-covered top (crew neck, turtleneck, jacket or blouse with a modest neckline) similar in spirit to image 2, adapted to her real hair texture and length (do not replace her hair texture with the muse's). Soft diffused beauty lighting and a clean backdrop in the same color family as image 2. Look mood: ${a?.mood ?? "same as reference"}. ${safe ? "A wholesome, family-friendly editorial beauty and fashion photo, fully clothed in modest outerwear with high neckline. " : ""}Photorealistic, high detail, no text.`;
}

export type InputImage = { buf: Buffer; name: string; type: "image/jpeg" | "image/png" };

export async function generateFromImages(images: InputImage[], prompt: string): Promise<Buffer> {
  const c = client();
  const res = await c.images.edit({
    model: MODEL,
    image: await Promise.all(images.map((i) => toFile(i.buf, i.name, { type: i.type }))),
    prompt,
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

export async function generateApplied(opts: {
  selfie: Buffer;
  selfieType?: "image/jpeg" | "image/png";
  look: Buffer;
  prompt: string;
}): Promise<Buffer> {
  const png = opts.selfieType === "image/png";
  return generateFromImages(
    [
      { buf: opts.selfie, name: png ? "base.png" : "selfie.jpg", type: png ? "image/png" : "image/jpeg" },
      { buf: opts.look, name: "look.jpg", type: "image/jpeg" },
    ],
    opts.prompt,
  );
}
