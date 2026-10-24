// Precompute hashtags for each sample look (Haiku, text-only from the stored analysis).
// Run: node --env-file=.env.local scripts/sample-hashtags.mjs
import Anthropic from "@anthropic-ai/sdk";
import { readFile, writeFile } from "node:fs/promises";
const c = new Anthropic();
const schema = { type: "object", additionalProperties: false, required: ["hashtags"], properties: { hashtags: { type: "array", items: { type: "string" } } } };
const looks = JSON.parse(await readFile("src/data/sample-looks.json", "utf8"));
await Promise.all(looks.map(async (l) => {
  for (let attempt = 0; attempt < 3 && !l.hashtags?.length; attempt++) try {
  const res = await c.messages.create({
    model: "claude-haiku-5-5", max_tokens: 300,
    system: 'Return "hashtags": 5 short hashtags for this makeup look WITHOUT the # sign (lowercase, no spaces): 1-2 Korean beauty trend keywords from this list only when they truly fit (가을, 굽굽, 어른여자, 얼음, 글로우, 걸크러쉬, 청순) plus 3-4 descriptive English tags (for example glassskin, strawberrymilk, dewylips).',
    output_config: { format: { type: "json_schema", schema } },
    messages: [{ role: "user", content: JSON.stringify(l.analysis) }],
  });
  l.hashtags = JSON.parse(res.content.map((b) => b.text ?? "").join("")).hashtags.map((h) => h.replace(/^#+/, "").replace(/\s+/g, "").toLowerCase()).filter(Boolean).slice(0, 6);
  console.log(l.id, l.hashtags.join(" "));
  } catch (e) { console.log(l.id, "retry", e.message); }
}));
await writeFile("src/data/sample-looks.json", JSON.stringify(looks, null, 2));
