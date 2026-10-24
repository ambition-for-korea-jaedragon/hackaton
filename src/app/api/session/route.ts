import { analyzeLook } from "@/lib/claude";
import { createSession, updateSession, writeFileTo } from "@/lib/storage";
import { runGeneration } from "@/lib/generate-job";
import { runMuseProducts } from "@/lib/reco-agent";
import { readImage } from "@/lib/upload";

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "expected multipart form data" }, { status: 400 });
  }
  const img = await readImage(form, "look");
  if (img instanceof Response) return img;
  try {
    const analysis = await analyzeLook(img);
    const s = await createSession("live");
    await writeFileTo(s.id, "look.jpg", img.data);
    await updateSession(s.id, (st) => {
      st.analysis = analysis;
      st.mannequin = { status: "pending" };
      st.museProducts = { status: "pending" };
    });
    void runGeneration(s.id, "mannequin");
    void runMuseProducts(s.id);
    return Response.json({ id: s.id, analysis });
  } catch (e) {
    console.error("[session:create]", e instanceof Error ? e.message : e);
    return Response.json({ error: e instanceof Error ? e.message : "analysis failed" }, { status: 500 });
  }
}
