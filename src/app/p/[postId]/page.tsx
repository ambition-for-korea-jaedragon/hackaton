import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { PostView } from "@/components/post-view";
import type { Post } from "@/lib/types";
import { getPost, isPostId } from "@/lib/posts";

type Props = { params: Promise<{ postId: string }> };

async function origin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function loadPost(postId: string): Promise<{ post: Post | null; base: string }> {
  const base = await origin();
  try {
    return { post: isPostId(postId) ? await getPost(postId) : null, base };
  } catch {
    return { post: null, base };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params;
  const { post, base } = await loadPost(postId);
  if (!post) return { title: "Post — muselook" };
  const title = post.caption || post.mood;
  const image = new URL(post.myToneUrl, base).toString();
  return {
    title: `${title} — muselook`,
    description: `${post.mood} · ${post.skinTone.depth} ${post.skinTone.undertone} skin. Copy the look, keep your tone.`,
    openGraph: { title, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title, images: [image] },
  };
}

async function PostBody({ params }: Props) {
  const { postId } = await params;
  const { post } = await loadPost(postId);
  return <PostView post={post} />;
}

export default function Page({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <PostBody params={params} />
    </Suspense>
  );
}
