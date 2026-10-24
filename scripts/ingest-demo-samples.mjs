// Run the REAL pipeline once per demo look (analysis, hashtags, mannequin, web-searched muse products)
// and store the results as the pre-filled demo samples. Needs the app running on B (default :3100).
// Run: B=http://localhost:3100 node scripts/ingest-demo-samples.mjs
import { readFile, writeFile, copyFile } from "node:fs/promises";
import { LOOKS } from "./demo-sample-defs.mjs";
const B = process.env.B || "http://localhost:3100";
const DATA = process.env.DATA_DIR || "data";
const out = [];
let i = 0;
async function worker() {
  while (i < LOOKS.length) {
    const [id, name] = LOOKS[i++];
    const file = `muse-${id}.jpg`;
    try {
      const fd = new FormData();
      fd.append("look", new Blob([await readFile(`public/samples/${file}`)], { type: "image/jpeg" }), file);
      const r = await (await fetch(`${B}/api/session`, { method: "POST", body: fd })).json();
      if (!r.id) throw new Error(JSON.stringify(r).slice(0, 200));
      let s;
      for (let k = 0; k < 90; k++) {
        s = await (await fetch(`${B}/api/session/${r.id}`)).json();
        if (s.mannequin?.status !== "pending" && s.museProducts?.status !== "pending") break;
        await new Promise((x) => setTimeout(x, 3000));
      }
      if (s.mannequin?.status !== "done") throw new Error("mannequin " + s.mannequin?.status + " " + (s.mannequin?.error || ""));
      await copyFile(`${DATA}/sessions/${r.id}/mannequin.png`, `public/samples/mannequin-${id}.png`);
      out.push({ id, name, file, analysis: s.analysis, hashtags: s.hashtags, museProducts: s.museProducts?.items ?? [] });
      console.log(id, "ok", s.hashtags?.join(" "), "| muse products:", s.museProducts?.items?.length ?? 0, s.museProducts?.error ?? "");
    } catch (e) { console.log(id, "FAILED", e.message); }
  }
}
await Promise.all([1, 2, 3, 4].map(worker));
out.sort((a, b) => LOOKS.findIndex((l) => l[0] === a.id) - LOOKS.findIndex((l) => l[0] === b.id));
await writeFile("scripts/.demo-samples.json", JSON.stringify(out, null, 2));
console.log("wrote", out.length);
