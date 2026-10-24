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
- "hex" is an approximate swatch color as "#RRGGBB"; omit it if unknown.

Output ONLY one JSON object, no prose, no markdown fences:
{"products":[{"area":"skincare|base|eye|blush|lip","brand":"","name":"","shadeName":"","hex":"#RRGGBB","url":"product page URL","why":"one short line on why it fits","sourceUrl":"page used as evidence"}]}`;
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
  const model = process.env.PI_MODEL_RECO || "anthropic/claude-sonnet-5-5";
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
      const list = ProductList.parse(JSON.parse(text.slice(start, i + 1)));
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
