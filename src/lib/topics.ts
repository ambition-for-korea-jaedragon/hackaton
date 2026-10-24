// Hot-topic keywords shown as feed filters and hashtags (Korean beauty trend vocabulary).
// Safe for client and server. `hint` guides the classifier.
export const TOPICS = [
  { key: "fall", label: "가을", hint: "autumn palette: deep warm browns, burgundy, brick, terracotta, plum, cozy mood" },
  { key: "gupgup", label: "굽굽", hint: "'baked' warm look: toasty beige, brown, peach and coral tones on eyes, cheeks and lips, soft cozy glow" },
  { key: "adult", label: "어른여자", hint: "mature polished chic: refined muted tones, matte or satin finish, elegant, sophisticated, not cutesy" },
  { key: "icy", label: "얼음", hint: "cool 'frozen' look: icy lilac, silver, cool pink, glassy cool skin, frosted lips" },
  { key: "glow", label: "글로우", hint: "dewy glass-skin glow, luminous, juicy glossy lips, shimmer" },
  { key: "girlcrush", label: "걸크러쉬", hint: "bold stage glam: sharp liner, smoky or vivid color, strong lips, confident" },
  { key: "pure", label: "청순", hint: "pure and innocent: soft pastel pink or peach, sheer, fresh, natural, lovely" },
] as const;

export type TopicKey = (typeof TOPICS)[number]["key"];
export const TOPIC_KEYS = TOPICS.map((t) => t.key) as unknown as [TopicKey, ...TopicKey[]];
export const topicLabel = (k: string) => TOPICS.find((t) => t.key === k)?.label ?? k;
