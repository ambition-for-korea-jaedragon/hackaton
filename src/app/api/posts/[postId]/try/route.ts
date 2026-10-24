import { getPost, NO_STORE } from "@/lib/posts";
import { runGeneration } from "@/lib/generate-job";
import { createSession, loadSession, readFileFrom, updateSession, writeFileTo } from "@/lib/storage";

export async function POST(_req: Request, ctx: { params: Promise<{ postId: string }> }) {
  const { postId } = await ctx.params;
  const post = await getPost(postId);
  if (!post) return Response.json({ error: "not found" }, { status: 404, headers: NO_STORE });
  const src = await loadSession(post.sessionId).catch(() => null);
  const look = src ? await readFileFrom(src.id, "look.jpg").catch(() => null) : null;
  if (!src?.analysis || !look) {
    return Response.json({ error: "source look unavailable" }, { status: 404, headers: NO_STORE });
  }
  const analysis = src.analysis;
  const s = await createSession("live");
  await writeFileTo(s.id, "look.jpg", look);
  const mannequin = await readFileFrom(src.id, "mannequin.png").catch(() => null);
  if (mannequin) await writeFileTo(s.id, "mannequin.png", mannequin);
  await updateSession(s.id, (st) => {
    st.analysis = analysis;
    st.mannequin = { status: mannequin ? "done" : "pending" };
  });
  if (!mannequin) void runGeneration(s.id, "mannequin");
  return Response.json({ id: s.id }, { headers: NO_STORE });
}
