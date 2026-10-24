import type { Post, SessionState, ToneTranslation } from "@/lib/types";

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("Can't reach the server. Check your connection and try again.");
  }
  const j = await res.json().catch(() => null);
  if (!res.ok) throw new Error(j?.error ?? j?.message ?? `Something went wrong (${res.status}).`);
  return j as T;
}

export const imgUrl = (id: string, name: string) => `/api/files/${id}/${name}`;
export const getSession = (id: string) => api<SessionState>(`/api/session/${id}`);
export const postJson = <T>(url: string, body?: unknown, headers?: Record<string, string>) =>
  api<T>(url, {
    method: "POST",
    headers: body === undefined ? headers : { "content-type": "application/json", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
export const postForm = <T>(url: string, field: string, file: File) => {
  const fd = new FormData();
  fd.append(field, file);
  return api<T>(url, { method: "POST", body: fd });
};
export type { Post, ToneTranslation };

export const delKey = (postId: string) => `muselook:del:${postId}`;

export type ToneClass = "fair" | "medium" | "deep";
export function toneClass(depth: string): ToneClass {
  const d = depth.toLowerCase();
  if (d.includes("deep") || d.includes("dark")) return "deep";
  if (d.includes("medium") || d.includes("tan") || d.includes("olive")) return "medium";
  return "fair";
}
export const TONE_DOT: Record<ToneClass, string> = { fair: "#F3D9C8", medium: "#C68A62", deep: "#5A3825" };
