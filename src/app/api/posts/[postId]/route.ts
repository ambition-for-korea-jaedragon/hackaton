import { deletePost, getPost, NO_STORE } from "@/lib/posts";

export async function GET(_req: Request, ctx: { params: Promise<{ postId: string }> }) {
  const { postId } = await ctx.params;
  const post = await getPost(postId);
  if (!post) return Response.json({ error: "not found" }, { status: 404, headers: NO_STORE });
  return Response.json(post, { headers: NO_STORE });
}

export async function DELETE(req: Request, ctx: { params: Promise<{ postId: string }> }) {
  const { postId } = await ctx.params;
  const token = req.headers.get("x-delete-token") ?? "";
  const r = await deletePost(postId, token);
  if (r === "notfound") return Response.json({ error: "not found" }, { status: 404, headers: NO_STORE });
  if (r === "forbidden") return Response.json({ error: "forbidden" }, { status: 403, headers: NO_STORE });
  return Response.json({ ok: true }, { headers: NO_STORE });
}
