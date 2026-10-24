import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { LookAnalysis, ToneTranslation } from "./types";
import { catalog } from "./catalog";
import { TOPICS, TOPIC_KEYS } from "./topics";

const MODEL = "claude-sonnet-5-5"; // tone translation (needs the most judgment)
const FAST_MODEL = process.env.CLAUDE_FAST_MODEL || "claude-haiku-5-5"; // look analysis + topic tagging

function client() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
  return new Anthropic({ apiKey, timeout: 60_000, maxRetries: 1 });
}

type Img = { data: Buffer; mediaType: "image/jpeg" | "image/png" | "image/webp" };

const imgBlock = (i: Img) => ({
  type: "image" as const,
  source: { type: "base64" as const, media_type: i.mediaType, data: i.data.toString("base64") },
});

// Structured outputs require additionalProperties:false on every object.
function strictObjects(node: unknown) {
  if (Array.isArray(node)) return node.forEach(strictObjects);
  if (!node || typeof node !== "object") return;
  const o = node as Record<string, unknown>;
  if (o.type === "object") o.additionalProperties = false;
  Object.values(o).forEach(strictObjects);
}

async function callStructured<T>(opts: {
  system: string;
  content: Anthropic.Messages.ContentBlockParam[];
  schema: z.ZodType<T>;
  toolName: string;
  model?: string;
}): Promise<T> {
  const c = client();
  const schema = z.toJSONSchema(opts.schema, { io: "input" }) as Record<string, unknown>;
  delete schema.$schema;
  strictObjects(schema);
  let lastErr = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    const content: Anthropic.Messages.ContentBlockParam[] = attempt
      ? [...opts.content, { type: "text", text: `Your previous output was invalid (${lastErr}). Return valid output exactly matching the schema.` }]
      : opts.content;
    const res = await c.messages.create({
      model: opts.model ?? MODEL,
      max_tokens: 4096,
      system: opts.system,
      // Structured outputs (forced tool_choice is not supported on this model)
      output_config: { format: { type: "json_schema", schema }, effort: "low" },
      messages: [{ role: "user", content }],
    });
    const text = res.content.map((b) => (b.type === "text" ? b.text : "")).join("");
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      json = undefined;
    }
    const parsed = opts.schema.safeParse(json);
    if (parsed.success) return parsed.data;
    lastErr = parsed.error.issues.slice(0, 5).map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  }
  throw new Error(`Claude returned invalid structured output after retry: ${lastErr}`);
}

export const ANALYZE_SYSTEM = `You are a professional makeup artist analysing a makeup LOOK photo.
Return the look as structured data: a one-line "mood", and exactly 5 steps in order: skincare, base, eye, blush, lip.
For each step: "colors" (name + approximate hex of the visible product colors; empty array for skincare), "finish" (e.g. dewy, matte, glassy), "technique" (how it is applied), "tips" (points to watch), "productHints" (product TYPES/categories only, never assert exact brands or shades).
Infer skincare prep from the skin finish visible. Write in concise, friendly English for a US Gen Z audience. Hex must be #RRGGBB.
Also return "hashtags": 5 short hashtags for this look WITHOUT the # sign (lowercase, no spaces): 1-2 Korean beauty trend keywords from this list only when they truly fit (가을, 굽굽, 어른여자, 얼음, 글로우, 걸크러쉬, 청순) plus 3-4 descriptive English tags (for example glassskin, strawberrymilk, dewylips).`;

const LookAnalysisOut = LookAnalysis.extend({ hashtags: z.array(z.string()) });

export async function analyzeLook(look: Img): Promise<LookAnalysis & { hashtags: string[] }> {
  const r = await callStructured({
    system: ANALYZE_SYSTEM,
    content: [imgBlock(look), { type: "text", text: "Analyse this makeup look." }],
    schema: LookAnalysisOut,
    toolName: "return_look_analysis",
    model: FAST_MODEL,
  });
  const hashtags = r.hashtags.map((h) => h.replace(/^#+/, "").replace(/\s+/g, "").toLowerCase()).filter(Boolean).slice(0, 6);
  return { ...r, hashtags };
}

export const TRANSLATE_SYSTEM = `You are a makeup artist who adapts a makeup look to a different person's skin tone.
Given the look analysis (JSON) and the user's selfie:
1. Judge skinTone from the selfie: depth, undertone, and a representative skin hex (#RRGGBB) of bare facial skin.
2. For each area (base, eye, blush, lip; skincare only if relevant) output a change: fromHex (the look's main color) -> toHex (the color that gives the same intended effect on THIS skin tone) with a one-line reason in plain English.
3. Pick productIds ONLY from the provided SAMPLE catalog ids (do not invent ids). Choose items whose area, hex and toneFit match the toHex colors. If the catalog is empty, return [].
4. Provide a routine, ordered skincare -> base -> eye -> blush -> lip, with one concise step each in plain English.
Preserve the look's mood. Hex must be #RRGGBB.`;

export async function translateTone(analysis: LookAnalysis, selfie: Img): Promise<ToneTranslation> {
  const cat = catalog.map(({ id, area, shadeName, hex, finish, toneFit }) => ({ id, area, shadeName, hex, finish, toneFit }));
  const result = await callStructured({
    system: TRANSLATE_SYSTEM,
    content: [
      imgBlock(selfie),
      { type: "text", text: `Look analysis:\n${JSON.stringify(analysis)}\n\nSAMPLE catalog:\n${JSON.stringify(cat)}` },
    ],
    schema: ToneTranslation,
    toolName: "return_tone_translation",
  });
  const ids = new Set(catalog.map((c) => c.id));
  return { ...result, productIds: result.productIds.filter((i) => ids.has(i)) };
}

const TopicResult = z.object({ tags: z.array(z.enum(TOPIC_KEYS)) });

// Assign up to 2 hot-topic keywords to a look. Never throws; returns [] on failure.
export async function classifyTopics(analysis: LookAnalysis): Promise<string[]> {
  try {
    const topics = TOPICS.map((t) => `${t.key}: ${t.label} — ${t.hint}`).join("\n");
    const r = await callStructured({
      system: "You tag makeup looks with Korean beauty trend keywords. Pick the 1-2 best-fitting keys from the list (prefer the single best fit; add a second only if clearly true).",
      content: [{ type: "text", text: `Topics:\n${topics}\n\nLook:\n${JSON.stringify(analysis)}` }],
      schema: TopicResult,
      toolName: "return_topics",
      model: FAST_MODEL,
    });
    return r.tags.slice(0, 2);
  } catch (e) {
    console.error("[classifyTopics]", e instanceof Error ? e.message : e);
    return [];
  }
}
