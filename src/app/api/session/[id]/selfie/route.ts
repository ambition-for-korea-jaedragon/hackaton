import { loadSession, updateSession, writeFileTo } from "@/lib/storage";
import { readImage } from "@/lib/upload";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  let s = null;
  try {
    s = await loadSession(id);
  } catch {}
  if (!s) return Response.json({ error: "not found" }, { status: 404 });
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "expected multipart form data" }, { status: 400 });
  }
  const img = await readImage(form, "selfie");
  if (img instanceof Response) return img;
  await writeFileTo(id, "selfie.jpg", img.data);
  await updateSession(id, (st) => {
    // The As-is preview was removed: the selfie only feeds the tone translation (POST .../translate).
    st.applyTranslated = { status: "idle" };
    st.styled = { status: "idle" };
    delete st.translation;
  });
  return Response.json({ ok: true });
}
