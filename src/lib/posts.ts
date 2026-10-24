import "server-only";
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Post } from "./types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const POSTS_DIR = path.join(DATA_DIR, "posts");
const ID_RE = /^[A-Za-z0-9_-]{10}$/;
export const PAGE_SIZE = 20;

type StoredPost = Post & { deleteTokenHash: string };

export const NO_STORE = { "Cache-Control": "no-store" };

export function newPostId() {
  return randomBytes(8).toString("base64url").slice(0, 10);
}
export function newDeleteToken() {
  return randomBytes(24).toString("base64url");
}
export function hashToken(t: string) {
  return createHash("sha256").update(t).digest("hex");
}
export function isPostId(id: string) {
  return ID_RE.test(id);
}
const file = (id: string) => path.join(POSTS_DIR, `${id}.json`);

export async function savePost(post: Post, deleteToken: string) {
  await mkdir(POSTS_DIR, { recursive: true });
  const stored: StoredPost = { ...post, deleteTokenHash: hashToken(deleteToken) };
  await writeFile(file(post.id), JSON.stringify(stored, null, 2));
}

async function readStored(id: string): Promise<StoredPost | null> {
  if (!isPostId(id)) return null;
  try {
    return JSON.parse(await readFile(file(id), "utf8"));
  } catch {
    return null;
  }
}

function strip(s: StoredPost): Post {
  const { deleteTokenHash: _h, ...post } = s;
  void _h;
  return post;
}

export async function getPost(id: string): Promise<Post | null> {
  const s = await readStored(id);
  return s ? strip(s) : null;
}

export async function listPosts(cursor?: string): Promise<{ posts: Post[]; nextCursor?: string }> {
  let names: string[] = [];
  try {
    names = await readdir(POSTS_DIR);
  } catch {
    return { posts: [] };
  }
  const all: Post[] = [];
  for (const n of names) {
    if (!n.endsWith(".json")) continue;
    const s = await readStored(n.slice(0, -5));
    if (s) all.push(strip(s));
  }
  all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
  const rest = cursor ? all.filter((p) => p.createdAt < cursor) : all;
  const posts = rest.slice(0, PAGE_SIZE);
  const nextCursor = rest.length > PAGE_SIZE ? posts[posts.length - 1].createdAt : undefined;
  return { posts, nextCursor };
}

// returns "ok" | "notfound" | "forbidden"
export async function deletePost(id: string, token: string): Promise<"ok" | "notfound" | "forbidden"> {
  const s = await readStored(id);
  if (!s) return "notfound";
  const a = Buffer.from(hashToken(token));
  const b = Buffer.from(s.deleteTokenHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "forbidden";
  await unlink(file(id)).catch(() => {});
  return "ok";
}
