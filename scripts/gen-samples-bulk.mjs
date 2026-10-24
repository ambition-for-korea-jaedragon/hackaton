// SYNTHETIC sample photos (fictional people) for the demo feed. Run: node --env-file=.env.local scripts/gen-samples-bulk.mjs
import OpenAI from "openai";
import { writeFile, access } from "node:fs/promises";
const c = new OpenAI();
const P = "Photorealistic beauty portrait of a fictional young woman, front-facing, shoulders up, not a real person. ";
const looks = [
  ["look-cherry-blossom", "East Asian, K-pop idol stage makeup: luminous dewy skin, soft pink glitter lids with aegyo-sal highlight, rosy pink blush across the nose, glossy cherry-pink lip, soft pink backdrop, studio light."],
  ["look-smoky-plum", "Korean, K-pop girl-crush makeup: matte velvet skin, smoky plum-brown eyes with sharp black wing, contour, muted berry-plum lip, dark charcoal backdrop, dramatic studio light."],
  ["look-coral-summer", "East Asian, K-influencer summer makeup: sun-kissed glowy skin, coral-orange shimmer lids, coral blush high on cheeks, juicy coral gloss lip, bright sky-blue backdrop, daylight."],
  ["look-mlbb-nude", "Korean, everyday clean-girl K-beauty makeup: skin-like satin base, soft taupe-brown lids, barely-there peach blush, my-lips-but-better rosy nude lip, warm cream backdrop, soft window light."],
  ["look-red-velvet", "East Asian, K-pop retro glam makeup: porcelain-matte skin, warm brown crease, thin black liner, soft red blush, classic blue-red velvet lip, deep red backdrop, studio light."],
  ["look-icy-lilac", "Korean, Y2K K-pop makeup: glassy cool skin, icy lilac shimmer lids with silver glitter, cool pink blush, frosted lavender-pink gloss lip, pale silver backdrop, studio light."],
  ["look-golden-hour", "East Asian, K-influencer glam: bronzed radiant skin, golden-bronze shimmer lids, warm terracotta blush, caramel nude gloss lip, golden-hour backdrop."],
  ["look-strawberry-milk", "Korean, soft girl K-pop makeup: milky dewy skin, strawberry-pink matte lids, heavy pink blush under the eyes, gradient strawberry-red tint lip, pastel milk-pink backdrop."],
  ["look-bold-fuchsia", "East Asian, K-pop stage makeup: glossy skin, fuchsia and violet shimmer lids, fuchsia blush, bold magenta lip, neon purple backdrop, concert lighting."],
];
const selfies = [
  ["selfie-fair-cool", "Smartphone selfie of a fictional young woman with fair cool-toned skin and freckles, red hair, bare face with no makeup, soft daylight, plain wall."],
  ["selfie-light-neutral", "Smartphone selfie of a fictional young Latina woman with light neutral-beige skin, dark wavy hair, bare face with no makeup, soft daylight, plain wall."],
  ["selfie-medium-olive", "Smartphone selfie of a fictional young South Asian woman with medium olive skin, long black hair, bare face with no makeup, soft daylight, plain wall."],
  ["selfie-tan-warm", "Smartphone selfie of a fictional young Filipina woman with tan warm golden skin, straight dark hair, bare face with no makeup, soft daylight, plain wall."],
  ["selfie-deep-cool", "Smartphone selfie of a fictional young Black woman with deep cool-toned skin, short natural curls, bare face with no makeup, soft daylight, plain wall."],
  ["selfie-medium-deep-warm", "Smartphone selfie of a fictional young mixed-race woman with medium-deep warm brown skin, braids, bare face with no makeup, soft daylight, plain wall."],
];
const jobs = [...looks.map(([n, p]) => [n, P + p]), ...selfies.map(([n, p]) => [n, p + " Front-facing, neutral expression, not a real person, photorealistic."])];
let i = 0;
async function worker() {
  while (i < jobs.length) {
    const [name, prompt] = jobs[i++];
    const out = `public/samples/${name}.jpg`;
    try { await access(out); console.log(name, "exists"); continue; } catch {}
    try {
      const r = await c.images.generate({ model: "gpt-image-2.5-flare", prompt, size: "1024x1536", quality: "medium", output_format: "jpeg" });
      await writeFile(out, Buffer.from(r.data[0].b64_json, "base64"));
      console.log(name, "ok");
    } catch (e) { console.log(name, "ERR", e.message); }
  }
}
await Promise.all([1, 2, 3, 4, 5].map(worker));
