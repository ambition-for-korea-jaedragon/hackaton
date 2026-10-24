import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import samples from "@/data/sample-looks.json";
import { LookAnalysis } from "@/lib/types";
import { createSession, updateSession, writeFileTo } from "@/lib/storage";

const Body = z.object({ sampleId: z.string() });
const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(req: Request) {
  const body = Body.safeParse(await req.json().catch(() => null));
  if (!body.success) return Response.json({ error: "sampleId required" }, { status: 400, headers: NO_STORE });
  const sample = (samples as { id: string; file: string; analysis: unknown }[]).find((x) => x.id === body.data.sampleId);
  if (!sample) return Response.json({ error: "unknown sample" }, { status: 404, headers: NO_STORE });
  try {
    const analysis = LookAnalysis.parse(sample.analysis);
    const data = await readFile(path.join(process.cwd(), "public", "samples", sample.file));
    const s = await createSession("sample");
    await writeFileTo(s.id, "look.jpg", data);
    await updateSession(s.id, (st) => {
      st.analysis = analysis;
    });
    return Response.json({ id: s.id, analysis }, { headers: NO_STORE });
  } catch (e) {
    console.error("[session:sample]", e instanceof Error ? e.message : e);
    return Response.json({ error: "sample failed" }, { status: 500, headers: NO_STORE });
  }
}
