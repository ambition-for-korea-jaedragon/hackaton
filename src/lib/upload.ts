import "server-only";

const MAX = 10 * 1024 * 1024;
export type Upload = { data: Buffer; mediaType: "image/jpeg" | "image/png" | "image/webp" };

export async function readImage(form: FormData, field: string): Promise<Upload | Response> {
  const f = form.get(field);
  if (!(f instanceof File)) return Response.json({ error: `missing file field "${field}"` }, { status: 400 });
  if (f.size > MAX) return Response.json({ error: "file too large (max 10MB)" }, { status: 413 });
  const t = f.type;
  if (t !== "image/jpeg" && t !== "image/png" && t !== "image/webp")
    return Response.json({ error: "unsupported file type (jpeg/png/webp only)" }, { status: 415 });
  return { data: Buffer.from(await f.arrayBuffer()), mediaType: t };
}
