// Shared contract (main-owned). Change only via main session; update docs/spec.md together.
import { z } from "zod";

export const AREAS = ["skincare", "base", "eye", "blush", "lip"] as const;
export const Area = z.enum(AREAS);
export type Area = z.infer<typeof Area>;

const Hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const ColorSwatch = z.object({ name: z.string(), hex: Hex });

// ① Look analysis (Claude vision on the look photo)
export const LookStep = z.object({
  area: Area,
  colors: z.array(ColorSwatch), // empty for skincare
  finish: z.string(), // e.g. "dewy", "matte", "glassy"
  technique: z.string(), // how it is applied
  tips: z.array(z.string()), // points to watch
  productHints: z.array(z.string()), // product types/categories, never asserted exact brands
});
export const LookAnalysis = z.object({
  mood: z.string(), // one-line mood of the look
  steps: z.array(LookStep), // ordered skincare -> base -> eye -> blush -> lip
});
export type LookAnalysis = z.infer<typeof LookAnalysis>;

// ③ Tone translation (Claude, from look analysis + selfie)
export const ToneTranslation = z.object({
  skinTone: z.object({
    depth: z.string(), // e.g. "deep", "medium-deep"
    undertone: z.string(), // "warm" | "cool" | "neutral" | "olive" (free text allowed)
    hex: Hex,
  }),
  changes: z.array(
    z.object({ area: Area, fromHex: Hex, toHex: Hex, reason: z.string() }),
  ),
  productIds: z.array(z.string()), // CatalogItem.id values
  routine: z.array(z.object({ area: Area, step: z.string() })),
});
export type ToneTranslation = z.infer<typeof ToneTranslation>;

// Curated SAMPLE catalog (src/data/catalog.json)
export const CatalogItem = z.object({
  id: z.string(),
  brand: z.string(),
  name: z.string(),
  area: Area,
  shadeName: z.string(),
  hex: Hex, // approximate swatch color (sample, not verified against physical product)
  finish: z.string(),
  toneFit: z.array(z.string()), // e.g. ["fair","light","medium","tan","deep"]
  url: z.string().url(),
  sample: z.literal(true),
});
export type CatalogItem = z.infer<typeof CatalogItem>;

// Session state persisted as DATA_DIR/sessions/{id}/session.json
export type ImageStatus = "idle" | "pending" | "done" | "error";
export type SessionState = {
  id: string;
  createdAt: string;
  source: "live" | "sample"; // sample = precomputed demo result
  analysis?: LookAnalysis;
  translation?: ToneTranslation;
  applyOriginal: { status: ImageStatus; error?: string };
  applyTranslated: { status: ImageStatus; error?: string };
};

// API (all JSON unless noted)
// POST /api/session                multipart {look: File}            -> { id, analysis }
// POST /api/session/[id]/selfie    multipart {selfie: File}          -> { ok: true }   (starts ② generation in background)
// POST /api/session/[id]/translate (no body)                         -> { translation } (starts ③ generation in background)
// GET  /api/session/[id]                                             -> SessionState
// GET  /api/files/[id]/[name]      name in FILE_NAMES                -> image bytes
export const FILE_NAMES = ["look.jpg", "selfie.jpg", "apply_original.png", "apply_translated.png"] as const;
export type FileName = (typeof FILE_NAMES)[number];
export const fileUrl = (id: string, name: FileName) => `/api/files/${id}/${name}`;
