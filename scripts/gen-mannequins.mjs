// Pre-generate the mannequin image for each sample look. Run: node --env-file=.env.local scripts/gen-mannequins.mjs
import OpenAI, { toFile } from "openai";
import { readFile, writeFile, access } from "node:fs/promises";
const c = new OpenAI();
const looks = JSON.parse(await readFile("src/data/sample-looks.json", "utf8"));
export const prompt = (a) =>
  `Image 1 is a reference makeup look. Create a clean studio product-style render of ONLY the makeup, on a generic, anonymous cosmetics-counter display mannequin head: smooth matte white-ivory porcelain, NO hair, NO wig, NO ears, NO personality. Its facial features are deliberately minimal, neutral and standardized, with nothing distinctive: a plain symmetrical oval face, softly sculpted generic eye sockets, a simple straight nose bridge, an unremarkable lip shape, and simple natural-looking eyebrows and soft lashes (eyebrows are present but plain and generic). The same generic mannequin face for every look, so no viewer notices the face at all and attention goes only to the makeup. Head and neck only, front-facing, tightly framed, centered, on a plain seamless light neutral-gray backdrop with soft even studio light. Paint ONLY the makeup from image 1 onto it, with the reference's exact original colors, placement and finishes, so that the makeup itself is the only thing that stands out: ${a.steps
    .filter((s) => s.area !== "skincare")
    .map((s) => `${s.area}: ${s.colors.map((x) => `${x.name} ${x.hex}`).join(", ")}, ${s.finish}`)
    .join("; ")}. Photorealistic, no text.`;
let i = 0;
async function worker() {
  while (i < looks.length) {
    const l = looks[i++];
    const out = `public/samples/mannequin-${l.id}.png`;
    try { await access(out); console.log(l.id, "exists"); continue; } catch {}
    try {
      const r = await c.images.edit({
        model: "gpt-image-2.5-sunburst",
        image: [await toFile(await readFile(`public/samples/${l.file}`), "look.jpg", { type: "image/jpeg" })],
        prompt: prompt(l.analysis), size: "auto", quality: "high", output_format: "png", n: 1,
      });
      await writeFile(out, Buffer.from(r.data[0].b64_json, "base64"));
      console.log(l.id, "ok");
    } catch (e) { console.log(l.id, "ERR", e.message); }
  }
}
await Promise.all([1, 2, 3, 4, 5, 6].map(worker));
