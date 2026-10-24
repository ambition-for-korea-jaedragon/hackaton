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
  "Image 1 is the user's selfie; image 2 is a reference makeup look photo. Keep the exact same person from image 1: identical face shape, facial features, hairstyle, expression, pose, background and TRUE skin tone. Do NOT copy the face or skin tone of the person in image 2. Only apply makeup; change nothing else. Keep the selfie's identity and skin tone exactly, but carry over the reference look's mood: soft beauty lighting, and the finish and texture of the makeup (dewy/matte/glassy etc.). Photorealistic.";

export function originalPrompt(analysis: LookAnalysis | undefined, skinHex?: string): string {
  const steps = (analysis?.steps ?? [])
    .map((s) => `${s.area}: ${s.colors.map((c) => `${c.name} ${c.hex}`).join(", ") || "-"}; finish ${s.finish}; ${s.technique}`)
    .join("\n");
  return `${BASE_RULES}${skinHex ? ` The person's skin tone is about ${skinHex}; keep it.` : ""}
Apply the makeup look from image 2 to the person in image 1 exactly as-is.
Look mood: ${analysis?.mood ?? "same as reference"}
${steps}`;
}

export function translatedPrompt(analysis: LookAnalysis | undefined, t: ToneTranslation): string {
  const changes = t.changes
    .map((c) => `- ${c.area}: use ${c.toHex} (instead of the reference's ${c.fromHex}) — ${c.reason}`)
    .join("\n");
  return `${BASE_RULES} The person's skin tone is ${t.skinTone.depth}, ${t.skinTone.undertone} undertone, about ${t.skinTone.hex}; keep it exactly, along with identity and lighting.
Apply the makeup look from image 2 but with ADAPTED colors. The shifted colors must be clearly visible and clearly different from a plain copy of the reference look. Use exactly these colors per area:
${changes}
The makeup must be noticeably applied, editorial-level and well pigmented in these exact colors, not subtle or washed out, so the color shift is obvious at a glance.
Look mood: ${analysis?.mood ?? "same as reference"}. Same finish and technique as the reference look.`;
}

export async function generateApplied(opts: {
  selfie: Buffer;
  look: Buffer;
  prompt: string;
}): Promise<Buffer> {
  const c = client();
  const res = await c.images.edit({
    model: MODEL,
    image: [
      await toFile(opts.selfie, "selfie.jpg", { type: "image/jpeg" }),
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
