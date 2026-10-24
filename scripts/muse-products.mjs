// Precompute MUSE products for each sample look using the headless pi agent (web search).
// Run: node --env-file=.env.local scripts/muse-products.mjs   (needs `pi` on PATH; writes src/data/sample-looks.json)
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import os from "node:os";

const prompt = (analysis) => {
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
};

const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("PI_")));
const runPi = (p) => new Promise((res, rej) => {
  const c = spawn("pi", ["-p", "--no-session", "--no-skills", "--no-context-files", "--model", "anthropic/claude-sonnet-5-5", "--tools", "web_search,fetch_content,get_search_content", p], { cwd: os.tmpdir(), env });
  c.stdin.end(); let out = ""; const t = setTimeout(() => c.kill("SIGKILL"), 170000);
  c.stdout.on("data", (d) => (out += d)); c.on("close", (code) => { clearTimeout(t); code === 0 ? res(out) : rej(new Error("exit " + code)); });
});
const parse = (t) => { const a = t.indexOf("{"), b = t.lastIndexOf("}"); const j = JSON.parse(t.slice(a, b + 1)); if (!j.products?.length) throw new Error("empty"); return j.products; };

const looks = JSON.parse(await readFile("src/data/sample-looks.json", "utf8"));
let i = 0;
async function worker() {
  while (i < looks.length) {
    const l = looks[i++];
    if (l.museProducts?.length) { console.log(l.id, "exists"); continue; }
    for (let attempt = 0; attempt < 2; attempt++) {
      try { l.museProducts = parse(await runPi(prompt(l.analysis))); console.log(l.id, "ok", l.museProducts.map((p) => p.brand + " " + p.shadeName).join(" | ")); break; }
      catch (e) { console.log(l.id, "retry", e.message); }
    }
    await writeFile("src/data/sample-looks.json", JSON.stringify(looks, null, 2));
  }
}
await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
await writeFile("src/data/sample-looks.json", JSON.stringify(looks, null, 2));
