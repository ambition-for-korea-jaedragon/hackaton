import "server-only";
import { spawn } from "node:child_process";
import os from "node:os";
import { getCatalogItems, catalog } from "./catalog";
import { loadSession, updateSession } from "./storage";
import { trackJob } from "./jobs";
import { AREAS, Product, ProductList, type Area, type LookAnalysis, type ToneTranslation } from "./types";

// One short-lived agent per area; each searches for a single product.
const TIMEOUT_MS = 100_000;
// Bound concurrent pi processes (each is a ~300MB node process).
const MAX_PI = Number(process.env.PI_MAX_CONCURRENCY) || 10;
let activePi = 0;
const piWaiters: (() => void)[] = [];
async function withPiSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (activePi >= MAX_PI) await new Promise<void>((r) => piWaiters.push(r));
  activePi++;
  try {
    return await fn();
  } finally {
    activePi--;
    piWaiters.shift()?.();
  }
}

const RULES = `Rules:
- Use the web_search tool at most 3 times (fetch_content only if really needed), then answer. Find a REAL, currently sold Korean-brand (K-beauty) product that you actually saw on a page. Prefer Olive Young Global, the brand's official site, YesStyle or Stylevana. Never invent URLs.
- shadeName must be the exact shade name as sold on the product page (for example "21N Ivory"), with no notes or comments. If you cannot confirm the exact shade on a page, pick a different product whose shade you did confirm. For skincare, shadeName is "".
- url must be a specific product page (not a search, category or home page).
- "hex" is an approximate swatch color as "#RRGGBB"; omit it if unknown.`;

const SCHEMA = (area: Area, whyHint: string) =>
  `Output ONLY one JSON object, no prose, no markdown fences, with exactly ONE product:
{"products":[{"area":"${area}","brand":"","name":"","shadeName":"","hex":"#RRGGBB","url":"product page URL","why":"${whyHint}","sourceUrl":"page used as evidence"}]}`;

// MY TONE: one product for one area, adapted to the customer's skin tone.
export function buildToneAreaPrompt(area: Area, analysis: LookAnalysis, t: ToneTranslation): string {
  const finish = analysis.steps.find((s) => s.area === area)?.finish ?? "n/a";
  const ch = t.changes.find((c) => c.area === area);
  const target = ch
    ? `Target color ${ch.toHex} (adapted to the customer's skin tone), finish ${finish}. Reason: ${ch.reason}`
    : `No color target. Pick a prep product that suits a "${finish}" finish.`;
  const baseRule = area === "base" ? "\n- The base shade MUST match the customer's skin depth and undertone (deep shade ranges exist, for example TIRTIR)." : "";
  return `You are a K-beauty shopping assistant. Find ONE product for the "${area}" step of a makeup look.

Customer skin tone: depth ${t.skinTone.depth}, undertone ${t.skinTone.undertone}, approx hex ${t.skinTone.hex}.
Look mood: ${analysis.mood}
Area: ${area}. ${target}

${RULES}${baseRule}

${SCHEMA(area, "one short line on why it fits")}`;
}

// MUSE: one product for one area, matching the muse's original colors.
export function buildMuseAreaPrompt(area: Area, analysis: LookAnalysis): string {
  const st = analysis.steps.find((x) => x.area === area);
  const colors = st?.colors.map((c) => `${c.name} ${c.hex}`).join(", ") || "n/a";
  const baseRule = area === "base" ? "\n- Base: a shade matching the muse's complexion given by the base color above." : "";
  return `You are a K-beauty shopping assistant. Find ONE product that recreates the "${area}" step of this muse's makeup look exactly as shown (original colors, for the muse's own complexion).

Look mood: ${analysis.mood}
Area: ${area}. Colors: ${colors}; finish ${st?.finish ?? "n/a"}; ${st?.technique ?? ""}

${RULES}${baseRule}

${SCHEMA(area, "one short line on how it matches the muse")}`;
}

function cleanEnv(): NodeJS.ProcessEnv {
  const env = {} as NodeJS.ProcessEnv;
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith("PI_")) continue;
    if (v !== undefined) env[k] = v;
  }
  return env;
}

function redact(s: string): string {
  return s
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/(api[_-]?key|token|authorization)(["':=\s]+)[^\s"',]+/gi, "$1$2[redacted]");
}

function runPi(prompt: string): Promise<string> {
  return withPiSlot(() => runPiProcess(prompt));
}

function runPiProcess(prompt: string): Promise<string> {
  const bin = process.env.PI_BIN || "pi";
  const model = process.env.PI_MODEL_RECO || "anthropic/claude-haiku-5-5";
  const args = [
    "-p",
    "--no-session",
    "--no-skills",
    "--no-context-files",
    "--model",
    model,
    "--tools",
    "web_search,fetch_content,get_search_content",
    prompt,
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(/*turbopackIgnore: true*/ bin, args, { cwd: os.tmpdir(), env: cleanEnv() });
    child.stdin.end();
    let out = "";
    let err = "";
    let timedOut = false;
    let settled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, TIMEOUT_MS);
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err = (err + d).slice(-4000)));
    const fail = (m: string) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      console.error(`[reco] ${m}; stderr tail: ${redact(err.slice(-600))}`);
      reject(new Error(m));
    };
    child.on("error", (e) => fail(`pi spawn failed: ${e.message}`));
    child.on("close", (code) => {
      if (timedOut) return fail(`pi timed out after ${TIMEOUT_MS / 1000}s`);
      if (code !== 0) return fail(`pi exited with code ${code}`);
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(out);
    });
  });
}

function parseProducts(text: string): Product[] {
  const start = text.indexOf("{");
  if (start < 0) throw new Error("no JSON in pi output");
  // find first balanced {...} block (string-aware)
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) {
      const raw = JSON.parse(text.slice(start, i + 1)) as { products?: Record<string, unknown>[] };
      // Be lenient about swatch colors: drop a malformed hex instead of rejecting the whole list.
      for (const p of raw.products ?? []) if (typeof p.hex !== "string" || !/^#[0-9a-fA-F]{6}$/.test(p.hex)) delete p.hex;
      const list = ProductList.parse(raw);
      if (!list.products.length) throw new Error("empty product list");
      return list.products;
    }
  }
  throw new Error("unterminated JSON in pi output");
}

// Haiku sometimes answers in prose instead of JSON: retry once with a stricter reminder.
async function searchProducts(prompt: string): Promise<Product[]> {
  try {
    return parseProducts(await runPi(prompt));
  } catch (e) {
    console.error(`[reco] first attempt failed (${e instanceof Error ? e.message : e}); retrying`);
    return parseProducts(
      await runPi(`${prompt}\n\nIMPORTANT: your previous answer did not contain the required JSON. Search, then reply with ONLY the JSON object {"products":[...]} and nothing else.`),
    );
  }
}

// Search one product for one area; the agent's area is forced to the requested one.
async function searchArea(area: Area, prompt: string): Promise<Product> {
  const list = await searchProducts(prompt);
  const p = list.find((x) => x.area === area) ?? list[0];
  return { ...p, area };
}

type Key = "products" | "museProducts";

// Run one agent per area in parallel; each finished product is written to the session right away
// so the UI can show results as they arrive. Returns how many areas succeeded.
async function searchAllAreas(id: string, key: Key, prompts: Record<Area, string>): Promise<{ found: number; errors: string[] }> {
  const errors: string[] = [];
  await Promise.all(
    AREAS.map(async (area) => {
      try {
        const p = await searchArea(area, prompts[area]);
        await updateSession(id, (st) => {
          const cur = (st[key] ??= { status: "pending" });
          cur.items = [...(cur.items ?? []).filter((x) => x.area !== area), p];
        });
      } catch (e) {
        const msg = `${area}: ${e instanceof Error ? e.message : String(e)}`;
        errors.push(msg);
        console.error(`[reco] ${id} ${key} ${msg}`);
      }
    }),
  );
  const s = await loadSession(id);
  return { found: s?.[key]?.items?.length ?? 0, errors };
}

// Fire-and-forget; always settles session.products. Caller must NOT await.
export function runRecommendations(id: string): Promise<void> {
  return trackJob(`${id}:products`, () => runRecommendationsInner(id));
}

async function runRecommendationsInner(id: string): Promise<void> {
  try {
    const s = await loadSession(id);
    if (!s?.analysis || !s.translation) throw new Error("missing translation");
    const { analysis, translation } = s;
    const prompts = Object.fromEntries(AREAS.map((a) => [a, buildToneAreaPrompt(a, analysis, translation)])) as Record<Area, string>;
    const { found, errors } = await searchAllAreas(id, "products", prompts);
    if (found > 0) {
      await updateSession(id, (st) => {
        st.products = { status: "done", items: st.products?.items, error: errors.length ? errors.join("; ") : undefined };
      });
      return;
    }
    // Nothing found: fall back to the curated sample catalog (flagged as sample).
    let picks = getCatalogItems(translation.productIds);
    if (!picks.length) picks = catalog.slice(0, 5);
    const fb: Product[] = picks.map((c) => ({
      area: c.area,
      brand: c.brand,
      name: c.name,
      shadeName: c.shadeName,
      hex: c.hex,
      url: c.url,
      why: "Sample catalog pick",
      sourceUrl: c.url,
    }));
    await updateSession(id, (st) => {
      st.products = fb.length
        ? { status: "done", fallback: true, items: fb, error: errors.join("; ") }
        : { status: "error", error: errors.join("; ") || "no products available" };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[reco] ${id}: ${msg}`);
    await updateSession(id, (st) => {
      st.products = { status: "error", error: msg };
    }).catch(() => {});
  }
}

// Fire-and-forget; settles session.museProducts (no catalog fallback). Caller must NOT await.
export function runMuseProducts(id: string): Promise<void> {
  return trackJob(`${id}:museProducts`, () => runMuseProductsInner(id));
}

async function runMuseProductsInner(id: string): Promise<void> {
  try {
    const s = await loadSession(id);
    if (!s?.analysis) throw new Error("missing analysis");
    const { analysis } = s;
    const prompts = Object.fromEntries(AREAS.map((a) => [a, buildMuseAreaPrompt(a, analysis)])) as Record<Area, string>;
    const { found, errors } = await searchAllAreas(id, "museProducts", prompts);
    await updateSession(id, (st) => {
      st.museProducts =
        found > 0
          ? { status: "done", items: st.museProducts?.items }
          : { status: "error", error: errors.join("; ") || "no products found" };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[muse-products] ${id}: ${msg}`);
    await updateSession(id, (st) => {
      st.museProducts = { status: "error", error: msg };
    }).catch(() => {});
  }
}
