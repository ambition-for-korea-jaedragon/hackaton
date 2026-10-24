import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { loadSession, sessionDir, updateSession } from "./storage";
import type { SessionState } from "./types";

// Registry of in-process background jobs. Jobs live in this server process, so after a restart
// a session can be left "pending" forever; reconcileSession() turns those into errors.
const g = globalThis as { __muselookJobs?: Set<string> };
const running = (g.__muselookJobs ??= new Set<string>());

export async function trackJob<T>(key: string, fn: () => Promise<T>): Promise<T> {
  running.add(key);
  try {
    return await fn();
  } finally {
    running.delete(key);
  }
}

const KEYS = ["applyOriginal", "applyTranslated", "mannequin", "styled", "products", "museProducts"] as const;

export async function reconcileSession(s: SessionState): Promise<SessionState> {
  const stale = KEYS.filter((k) => s[k]?.status === "pending" && !running.has(`${s.id}:${k}`));
  if (!stale.length) return s;
  // Give a freshly started job a moment to register before declaring it lost.
  const age = Date.now() - (await stat(path.join(sessionDir(s.id), "session.json"))).mtimeMs;
  if (age < 20_000) return s;
  await updateSession(s.id, (st) => {
    for (const k of stale) if (st[k]?.status === "pending") st[k] = { status: "error", error: "Interrupted. Please try again." };
  });
  return (await loadSession(s.id)) ?? s;
}
