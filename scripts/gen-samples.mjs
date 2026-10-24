// Generates SYNTHETIC sample photos (fictional people) for the demo. Run: node --env-file=.env.local scripts/gen-samples.mjs
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";
const c = new OpenAI();
const jobs = [
  ["look-peach-glass.jpg", "Photorealistic beauty portrait of a fictional young East Asian woman in K-pop idol stage makeup: peachy dewy glass skin, sheer satin base, soft peach and coral shimmer eyeshadow with short brown liner, high pastel pink blush, blurred cherry-red gradient lip tint. Front-facing, shoulders up, soft studio light, pastel pink backdrop. Not a real person."],
  ["selfie-deep.jpg", "Photorealistic smartphone selfie of a fictional young Black woman with deep warm brown skin, bare face with no makeup, natural hair pulled back, front-facing, neutral expression, soft daylight from a window, plain light wall. Not a real person."],
];
await Promise.all(jobs.map(async ([name, prompt]) => {
  const t = Date.now();
  const r = await c.images.generate({ model: "gpt-image-2.5-flare", prompt, size: "1024x1536", quality: "medium", output_format: "jpeg" });
  await writeFile(`public/samples/${name}`, Buffer.from(r.data[0].b64_json, "base64"));
  console.log(name, "ok", ((Date.now() - t) / 1000).toFixed(1) + "s");
}));
