import { fileUrl, PostInput, type Post } from "@/lib/types";
import { loadSession } from "@/lib/storage";
import { listPosts, newDeleteToken, newPostId, NO_STORE, savePost } from "@/lib/posts";

export async function GET(req: Request) {
  const cursor = new URL(req.url).searchParams.get("cursor") || undefined;
  return Response.json(await listPosts(cursor), { headers: NO_STORE });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400, headers: NO_STORE });
  }
  const parsed = PostInput.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid input" }, { status: 400, headers: NO_STORE });
  const input = parsed.data;
  let s;
  try {
    s = await loadSession(input.sessionId);
  } catch {
    s = null;
  }
  if (!s) return Response.json({ error: "session not found" }, { status: 404, headers: NO_STORE });
  if (!s.analysis || !s.translation || s.applyOriginal.status !== "done" || s.applyTranslated.status !== "done") {
    return Response.json({ error: "session not ready" }, { status: 409, headers: NO_STORE });
  }
  const post: Post = {
    id: newPostId(),
    sessionId: s.id,
    createdAt: new Date().toISOString(),
    caption: input.caption.trim().slice(0, 140),
    mood: s.analysis.mood,
    skinTone: { depth: s.translation.skinTone.depth, undertone: s.translation.skinTone.undertone },
    ...(input.includeLook ? { lookUrl: fileUrl(s.id, "look.jpg") } : {}),
    asIsUrl: fileUrl(s.id, "apply_original.png"),
    myToneUrl: fileUrl(s.id, "apply_translated.png"),
    products: (s.products?.items ?? []).slice(0, 5),
  };
  const deleteToken = newDeleteToken();
  await savePost(post, deleteToken);
  return Response.json({ post, deleteToken }, { headers: NO_STORE });
}
