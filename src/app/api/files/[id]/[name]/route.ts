import { FILE_NAMES, type FileName } from "@/lib/types";
import { readFileFrom } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string; name: string }> }) {
  const { id, name } = await ctx.params;
  if (!(FILE_NAMES as readonly string[]).includes(name)) return new Response("not found", { status: 404 });
  let data: Buffer | null = null;
  try {
    data = await readFileFrom(id, name as FileName);
  } catch {}
  if (!data) return new Response("not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": name.endsWith(".png") ? "image/png" : "image/jpeg",
      "Cache-Control": "no-store",
    },
  });
}
