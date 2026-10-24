// SYNTHETIC sample looks (fictional people). Run: node --env-file=.env.local scripts/gen-more-looks.mjs
import OpenAI from "openai";
import { writeFile } from "node:fs/promises";
const c = new OpenAI();
const jobs = [
  ["look-mauve-cool.jpg", "Photorealistic beauty portrait of a fictional young East Asian woman in K-pop idol makeup: cool-toned soft matte skin, mauve and lilac shimmer eyeshadow with a thin black wing, cool mauve-pink blush, muted plum-rose velvet lip. Front-facing, shoulders up, soft studio light, pale lavender backdrop. Not a real person."],
  ["look-brick-sunset.jpg", "Photorealistic beauty portrait of a fictional young Korean woman in warm K-influencer makeup: healthy satin skin, warm terracotta and copper shimmer eyeshadow, peach-orange draped blush, brick-red glossy lip. Front-facing, shoulders up, golden hour light, warm beige backdrop. Not a real person."],
];
await Promise.all(jobs.map(async ([name, prompt]) => {
  const r = await c.images.generate({ model: "gpt-image-2.5-flare", prompt, size: "1024x1536", quality: "medium", output_format: "jpeg" });
  await writeFile(`public/samples/${name}`, Buffer.from(r.data[0].b64_json, "base64"));
  console.log(name, "ok");
}));
