// Backfill topic tags on existing posts. Run: node --env-file=.env.local scripts/backfill-tags.mjs
import Anthropic from "@anthropic-ai/sdk";
import { readdir, readFile, writeFile } from "node:fs/promises";
const TOPICS = [
  ["fall", "가을", "autumn palette: deep warm browns, burgundy, brick, terracotta, plum, cozy mood"],
  ["gupgup", "굽굽", "'baked' warm look: toasty beige, brown, peach and coral tones on eyes, cheeks and lips, soft cozy glow"],
  ["adult", "어른여자", "mature polished chic: refined muted tones, matte or satin finish, elegant, sophisticated, not cutesy"],
  ["icy", "얼음", "cool 'frozen' look: icy lilac, silver, cool pink, glassy cool skin, frosted lips"],
  ["glow", "글로우", "dewy glass-skin glow, luminous, juicy glossy lips, shimmer"],
  ["girlcrush", "걸크러쉬", "bold stage glam: sharp liner, smoky or vivid color, strong lips, confident"],
  ["pure", "청순", "pure and innocent: soft pastel pink or peach, sheer, fresh, natural, lovely"],
];
const c = new Anthropic();
const dir = process.env.DATA_DIR || "data";
const files = (await readdir(`${dir}/posts`)).filter((f) => f.endsWith(".json"));
await Promise.all(files.map(async (f) => {
  const post = JSON.parse(await readFile(`${dir}/posts/${f}`, "utf8"));
  const sess = JSON.parse(await readFile(`${dir}/sessions/${post.sessionId}/session.json`, "utf8"));
  const res = await c.messages.create({
    model: "claude-sonnet-5-5", max_tokens: 300,
    system: "You tag makeup looks with Korean beauty trend keywords. Pick the 1-2 best-fitting keys from the list (prefer the single best fit; add a second only if clearly true).",
    output_config: { effort: "low", format: { type: "json_schema", schema: { type: "object", additionalProperties: false, required: ["tags"], properties: { tags: { type: "array", items: { type: "string", enum: TOPICS.map((t) => t[0]) } } } } } },
    messages: [{ role: "user", content: `Topics:\n${TOPICS.map((t) => `${t[0]}: ${t[1]} — ${t[2]}`).join("\n")}\n\nLook:\n${JSON.stringify(sess.analysis)}` }],
  });
  post.tags = JSON.parse(res.content.map((b) => b.text ?? "").join("")).tags.slice(0, 2);
  await writeFile(`${dir}/posts/${f}`, JSON.stringify(post, null, 2));
  console.log(post.id, post.mood.slice(0, 40), "→", post.tags.join(","));
}));
