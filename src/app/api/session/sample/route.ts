import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import samples from "@/data/sample-looks.json";
import { LookAnalysis, type AreaPoints, type Product } from "@/lib/types";
import { runGeneration } from "@/lib/generate-job";
import { createSession, updateSession, writeFileTo } from "@/lib/storage";

const Body = z.object({ sampleId: z.string() });
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "sampleId required" }, { status: 400, headers: NO_STORE });
  const sample = (samples as { id: string; file: string; analysis: unknown; museProducts?: unknown[]; points?: AreaPoints }[]).find((x) => x.id === body.data.sampleId);
  if (!sample) return Response.json({ error: "unknown sample" }, { status: 404, headers: NO_STORE });
  try {
    const analysis = LookAnalysis.parse(sample.analysis);
    const data = await readFile(path.join(process.cwd(), "public", "samples", sample.file));
    const s = await createSession("sample");
    await writeFileTo(s.id, "look.jpg", data);
    const mannequin = await readFile(path.join(process.cwd(), "public", "samples", `mannequin-${sample.id}.png`)).catch(() => null);
    if (mannequin) await writeFileTo(s.id, "mannequin.png", mannequin);
    await updateSession(s.id, (st) => {
      st.analysis = analysis;
      st.sampleId = sample.id;
      if (sample.points) st.points = sample.points;
      if (sample.museProducts?.length) st.museProducts = { status: "done", items: sample.museProducts as Product[] };
      st.mannequin = { status: mannequin ? "done" : "pending" };
    });
    if (!mannequin) void runGeneration(s.id, "mannequin");
    return Response.json({ id: s.id, analysis }, { headers: NO_STORE });
  } catch (e) {
    console.error("[session:sample]", e instanceof Error ? e.message : e);
    return Response.json({ error: "sample failed" }, { status: 500, headers: NO_STORE });
  }
}
