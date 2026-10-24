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
export type LookStep = z.infer<typeof LookStep>;
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

// Web-searched product recommendations (headless pi agent with web_search), after ③ translation
export const Product = z.object({
  area: Area,
  brand: z.string(),
  name: z.string(),
  shadeName: z.string(), // "" for skincare
  hex: Hex.optional(), // approximate, from search results; omit if unknown
  url: z.string().url(), // product or retailer page found by search
  why: z.string(), // one line: why this fits the translated color / tone / finish
  sourceUrl: z.string().url(), // page the agent used as evidence
});
export type Product = z.infer<typeof Product>;
export const ProductList = z.object({ products: z.array(Product) });

// Face anchor points on look.jpg, normalized 0..1 (x from left, y from top). Used for product callout pins on the muse photo.
export const AreaPoints = z.object({
  skincare: z.object({ x: z.number(), y: z.number() }), // forehead center (skin prep has no visible product)
  base: z.object({ x: z.number(), y: z.number() }), // cheek/skin area beside the nose
  eye: z.object({ x: z.number(), y: z.number() }), // center of the upper eyelid of the eye on the image's LEFT side
  blush: z.object({ x: z.number(), y: z.number() }), // apple of the cheek on the image's RIGHT side
  lip: z.object({ x: z.number(), y: z.number() }), // center of the lips
});
export type AreaPoints = z.infer<typeof AreaPoints>;

// Session state persisted as DATA_DIR/sessions/{id}/session.json
export type ImageStatus = "idle" | "pending" | "done" | "error";
export type SessionState = {
  id: string;
  createdAt: string;
  source: "live" | "sample"; // sample = precomputed demo result
  hashtags?: string[]; // 3-6 tags (no '#') extracted from the look at analysis time; shown on the Breakdown screen
  points?: AreaPoints; // face anchor points on look.jpg for callout pins: samples carry precomputed points; live looks compute in the browser
  sampleId?: string; // set for sample sessions (and copied by 'try'); lets posts reuse precomputed face points
  analysis?: LookAnalysis;
  translation?: ToneTranslation;
  applyOriginal: { status: ImageStatus; error?: string };
  applyTranslated: { status: ImageStatus; error?: string };
  mannequin?: { status: ImageStatus; error?: string }; // generated from look.jpg + analysis (no selfie needed); samples ship a pre-generated file
  styled?: { status: ImageStatus; error?: string }; // generated after applyTranslated is done
  products?: { status: ImageStatus; items?: Product[]; error?: string; fallback?: boolean }; // MY TONE products (translated shades); fallback = sample catalog used
  museProducts?: { status: ImageStatus; items?: Product[]; error?: string }; // MUSE products: real K-beauty products matching the muse look's ORIGINAL colors (web search)
};

// Social: public posts of (look + as-is + my tone). Persisted as DATA_DIR/posts/{postId}.json
export const PostInput = z.object({
  sessionId: z.string(),
  caption: z.string().max(140).default(""),
  includeLook: z.boolean().default(true), // user may hide the source look photo
});
export type Post = {
  id: string; // short url-safe id
  sessionId: string;
  createdAt: string;
  caption: string;
  mood: string;
  skinTone: { depth: string; undertone: string };
  lookUrl?: string; // muse photo; omitted if includeLook=false (UI shows a placeholder tile)
  mannequinUrl: string; // mannequin.png
  myToneUrl: string; // apply_translated.png (selfie-style, tone-translated makeup)
  styledUrl: string; // styled.png
  products: Product[]; // MY TONE products, up to 5, copied at post time
  museProducts?: Product[]; // MUSE products (original look colors), up to 5; absent on older posts
  points?: AreaPoints; // optional stored override; the client normally computes pins from face landmarks (src/lib/client/face-points.ts)
  tags?: string[]; // topic keys from src/lib/topics.ts (max 2), assigned by Claude at post time
};

// API (all JSON unless noted)
// POST   /api/posts                 PostInput (requires applyTranslated, mannequin and styled all done) -> { post, deleteToken }
// GET    /api/posts?cursor=         -> { posts: Post[], nextCursor?: string }  newest first, 20 per page
// GET    /api/posts/[postId]        -> Post
// DELETE /api/posts/[postId]        header x-delete-token                  -> { ok: true }
// POST   /api/posts/[postId]/try    -> { id } new session reusing the post's look + analysis (skips ①)
// Page   /p/[postId]                public post page with OG image = myToneUrl
// POST /api/session                multipart {look: File}            -> { id, analysis }
// POST /api/session/sample         JSON {sampleId}                   -> { id, analysis }  (copies public/samples/{file}, cached analysis from src/data/sample-looks.json; source='sample')
// POST /api/session/[id]/selfie    multipart {selfie: File}          -> { ok: true }   (starts ② generation in background)
// POST /api/session/[id]/translate (no body)                         -> { translation } (starts ③ generation in background; when applyTranslated is done, styled generation starts automatically)
// POST /api/session (live look): after analysis, mannequin generation starts in background.
//      translate also starts the web product search job in background (products.status pending -> done/error)
// GET  /api/session/[id]                                             -> SessionState
// GET  /api/files/[id]/[name]      name in FILE_NAMES                -> image bytes
// 4-up group shown everywhere (feed, post, My Tone):
//   top-left  mannequin.png        neutral mannequin face wearing ONLY the look's makeup (original colors)
//   top-right look.jpg             the muse (reference look photo)
//   bottom-left apply_translated.png  selfie-style photo of the user's own face wearing the tone-translated makeup
//   bottom-right styled.png        slightly wider shot of the user (same makeup) showing hair styling + accessories like the muse
// apply_original.png (the look as-is on the user) stays in the create flow only, not in the 4-up.
export const FILE_NAMES = ["look.jpg", "selfie.jpg", "apply_original.png", "apply_translated.png", "mannequin.png", "styled.png"] as const;
export type FileName = (typeof FILE_NAMES)[number];
export const fileUrl = (id: string, name: FileName) => `/api/files/${id}/${name}`;
