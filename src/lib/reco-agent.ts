import "server-only";
import { spawn } from "node:child_process";
import os from "node:os";
import { getCatalogItems, catalog } from "./catalog";
import { loadSession, updateSession } from "./storage";
import { Product, ProductList, type LookAnalysis, type ToneTranslation } from "./types";

const TIMEOUT_MS = 150_000;

export function buildRecoPrompt(analysis: LookAnalysis, t: ToneTranslation): string {
  const areas = t.changes
    .map((c) => {
      const finish = analysis.steps.find((s) => s.area === c.area)?.finish ?? "n/a";
      return `- ${c.area}: target color ${c.toHex}, finish ${finish}. Reason: ${c.reason}`;
    })
    .join("\n");
  return `You are a K-beauty shopping assistant. Use the web_search tool (and fetch_content if needed) to find REAL, currently sold Korean-brand (K-beauty) products.

Customer skin tone: depth ${t.skinTone.depth}, undertone ${t.skinTone.undertone}, approx hex ${t.skinTone.hex}.
Look mood: ${analysis.mood}
Target per area (already adapted to the customer's skin tone):
${areas}

Task: recommend exactly 1 product for each of these areas: skincare, base, eye, blush, lip.
- The base product MUST have a shade that matches the customer's skin depth and undertone (deep shade ranges exist, e.g. TIRTIR).
- The color, shade and finish should match the target color and finish for each area. For skincare, pick a prep product that suits the finish; shadeName is "".
- Only products you actually found on a page via search. Prefer Olive Young Global, the brand's official site, YesStyle or Stylevana pages. Never invent URLs.
- shadeName must be the exact shade name as sold on the product page (e.g. "21N Ivory"), with no notes or comments such as "check selector". If you cannot confirm the exact shade on a page, pick a different product whose shade you did confirm.
- url must be a specific product page for that product (not a search, category or home page).
- "hex" is an approximate swatch color as "#RRGGBB"; omit it if unknown.

Output ONLY one JSON object, no prose, no markdown fences:
{"products":[{"area":"skincare|base|eye|blush|lip","brand":"","name":"","shadeName":"","hex":"#RRGGBB","url":"product page URL","why":"one short line on why it fits","sourceUrl":"page used as evidence"}]}`;
}

// MUSE products: real K-beauty products that reproduce the muse look's ORIGINAL colors (no skin-tone adaptation).
export function buildMusePrompt(analysis: LookAnalysis): string {
  const areas = analysis.steps
    .map((s) => `- ${s.area}: colors ${s.colors.map((c) => `${c.name} ${c.hex}`).join(", ") || "n/a"}; finish ${s.finish}; ${s.technique}`)
    .join("\n");
  return `You are a K-beauty shopping assistant. Use the web_search tool (and fetch_content if needed) to find REAL, currently sold Korean-brand (K-beauty) products that recreate this muse's makeup look exactly as shown (original colors, for the muse's own light complexion).

Look mood: ${analysis.mood}
Muse look by area:
${areas}

Task: recommend exactly 1 product for each of these areas: skincare, base, eye, blush, lip.
- Match each area's color and finish as closely as possible (base: a shade matching the muse's complexion in the base color above). For skincare, pick a prep product that suits the finish; shadeName is "".
- Only products you actually found on a page via search. Prefer Olive Young Global, the brand's official site, YesStyle or Stylevana pages. Never invent URLs.
- shadeName must be the exact shade name as sold on the product page, with no notes or comments. If you cannot confirm the exact shade on a page, pick a different product whose shade you did confirm.
- url must be a specific product page for that product (not a search, category or home page).
- "hex" is an approximate swatch color as "#RRGGBB"; omit it if unknown.
- "why": one short line saying how it matches the muse's color/finish.

Output ONLY one JSON object, no prose, no markdown fences:
{"products":[{"area":"skincare|base|eye|blush|lip","brand":"","name":"","shadeName":"","hex":"#RRGGBB","url":"product page URL","why":"one short line on how it matches the muse","sourceUrl":"page used as evidence"}]}`;
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

// Fire-and-forget; always settles session.products. Caller must NOT await.
export async function runRecommendations(id: string): Promise<void> {
  try {
    const s = await loadSession(id);
    if (!s?.analysis || !s.translation) throw new Error("missing translation");
    const { analysis, translation } = s;
    let items: Product[] | undefined;
    let error: string | undefined;
    try {
      items = parseProducts(await runPi(buildRecoPrompt(analysis, translation)));
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
      console.error(`[reco] ${id}: ${error}`);
    }
    if (items) {
      await updateSession(id, (st) => {
        st.products = { status: "done", items };
      });
      return;
    }
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
        ? { status: "done", fallback: true, items: fb, error }
        : { status: "error", error: error ?? "no products available" };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[reco] ${id}: ${msg}`);
    await updateSession(id, (st) => {
      st.products = { status: "error", error: msg };
    }).catch(() => {});
  }
}

// Fire-and-forget; settles session.museProducts (no catalog fallback: errors are shown as unavailable). Caller must NOT await.
export async function runMuseProducts(id: string): Promise<void> {
  try {
    const s = await loadSession(id);
    if (!s?.analysis) throw new Error("missing analysis");
    const items = parseProducts(await runPi(buildMusePrompt(s.analysis)));
    await updateSession(id, (st) => {
      st.museProducts = { status: "done", items };
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[muse-products] ${id}: ${msg}`);
    await updateSession(id, (st) => {
      st.museProducts = { status: "error", error: msg };
    }).catch(() => {});
  }
}
