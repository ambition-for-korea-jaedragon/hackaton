import { translateTone } from "@/lib/claude";
import { loadSession, readFileFrom, updateSession } from "@/lib/storage";
import { runGeneration } from "@/lib/generate-job";
import { runRecommendations } from "@/lib/reco-agent";

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let s = null;
  try {
    s = await loadSession(id);
  } catch {}
  if (!s) return Response.json({ error: "not found" }, { status: 404 });
  const selfie = await readFileFrom(id, "selfie.jpg");
  if (!s.analysis || !selfie)
    return Response.json({ error: "analysis and selfie are required first" }, { status: 409 });
  try {
    const translation = await translateTone(s.analysis, { data: selfie, mediaType: "image/jpeg" });
    await updateSession(id, (st) => {
      st.translation = translation;
      st.applyTranslated = { status: "pending" };
      st.styled = { status: "idle" };
      st.products = { status: "pending" };
    });
    void runGeneration(id, "translated");
    void runRecommendations(id);
    return Response.json({ translation });
  } catch (e) {
    console.error("[session:translate]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : "translation failed" }, { status: 500 });
  }
}
