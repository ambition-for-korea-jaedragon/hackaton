import { loadSession } from "@/lib/storage";
import { reconcileSession } from "@/lib/jobs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let s = null;
  try {
    s = await loadSession(id);
    if (s) s = await reconcileSession(s);
  } catch {}
  if (!s) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(s, { headers: { "Cache-Control": "no-store" } });
}
