// Generate the SYNTHETIC demo sample photos (fictional people) into public/samples.
// Run: node --env-file=.env.local scripts/gen-demo-samples.mjs
import OpenAI from "openai";
import { writeFile, access } from "node:fs/promises";
const c = new OpenAI();
import { P, LOOKS, SELFIES } from "./demo-sample-defs.mjs";
const jobs = [
  ...LOOKS.map(([id, , p]) => [`muse-${id}`, P + p]),
  ...SELFIES.map(([id, , p]) => [`me-${id}`, `Smartphone selfie of a fictional young woman with ${p}, soft daylight, plain wall, front-facing, neutral expression, not a real person, photorealistic.`]),
];
let i = 0;
async function worker() {
  while (i < jobs.length) {
    const [name, prompt] = jobs[i++];
    const out = `public/samples/${name}.jpg`;
    try { await access(out); console.log(name, "exists"); continue; } catch {}
    for (let a = 0; a < 3; a++) {
      try {
        const r = await c.images.generate({ model: "gpt-image-2.5-flare", prompt, size: "1024x1536", quality: "medium", output_format: "jpeg" });
        await writeFile(out, Buffer.from(r.data[0].b64_json, "base64")); console.log(name, "ok"); break;
      } catch (e) { console.log(name, "retry", e.message.slice(0, 80)); }
    }
  }
}
await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
