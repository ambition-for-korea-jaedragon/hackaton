// Precompute hashtags for the demo samples (Haiku, from the stored analysis). Reads/writes scripts/.demo-samples.json.
// Run: node --env-file=.env.local scripts/sample-hashtags.mjs
import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "node:fs/promises";
const c = new Anthropic();
const SYSTEM = (await readFile("/tmp/hint.txt", "utf8")).replace(/^Also return "hashtags": /, 'Return "hashtags": ');
const schema = { type: "object", additionalProperties: false, required: ["hashtags"], properties: { hashtags: { type: "array", items: { type: "string" } } } };
const looks = JSON.parse(await readFile("scripts/.demo-samples.json", "utf8"));
await Promise.all(looks.map(async (l) => {
  for (let a = 0; a < 3; a++) try {
    const res = await c.messages.create({ model: "claude-haiku-5-5", max_tokens: 300, system: SYSTEM, output_config: { format: { type: "json_schema", schema } }, messages: [{ role: "user", content: `Look: ${l.name}\n${JSON.stringify(l.analysis)}` }] });
    l.hashtags = JSON.parse(res.content.map((b) => b.text ?? "").join("")).hashtags.map((h) => h.replace(/^#+/, "").replace(/\s+/g, "").toLowerCase()).filter(Boolean).slice(0, 6);
    console.log(l.id, l.hashtags.join(" ")); return;
  } catch (e) { console.log(l.id, "retry", e.message.slice(0, 60)); }
}));
await writeFile("scripts/.demo-samples.json", JSON.stringify(looks, null, 2));
