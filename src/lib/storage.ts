// Filesystem storage (main-owned). DATA_DIR: ./data locally, /data (Railway volume) in prod.
import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { FileName, SessionState } from "./types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const ID_RE = /^[0-9a-f-]{36}$/;

export function sessionDir(id: string) {
  if (!ID_RE.test(id)) throw new Error("invalid session id");
  return path.join(DATA_DIR, "sessions", id);
}

export async function createSession(source: SessionState["source"] = "live"): Promise<SessionState> {
  const id = randomUUID();
  await mkdir(sessionDir(id), { recursive: true });
  const state: SessionState = {
    id,
    createdAt: new Date().toISOString(),
    source,
    applyOriginal: { status: "idle" },
    applyTranslated: { status: "idle" },
  };
  await saveSession(state);
  return state;
}

export async function loadSession(id: string): Promise<SessionState | null> {
  try {
    return JSON.parse(await readFile(path.join(sessionDir(id), "session.json"), "utf8"));
  } catch {
    return null;
  }
}

export async function saveSession(state: SessionState) {
  await writeFile(path.join(sessionDir(state.id), "session.json"), JSON.stringify(state, null, 2));
}

// Read-modify-write helper, serialized per session (single long-lived process).
const locks = new Map<string, Promise<unknown>>();
export async function updateSession(id: string, fn: (s: SessionState) => void): Promise<SessionState> {
  const prev = locks.get(id) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(async () => {
    const s = await loadSession(id);
    if (!s) throw new Error("session not found");
    fn(s);
    await saveSession(s);
    return s;
  });
  locks.set(id, next);
  return next;
}

export async function writeFileTo(id: string, name: FileName, data: Buffer) {
  await writeFile(path.join(sessionDir(id), name), data);
}

export async function readFileFrom(id: string, name: FileName): Promise<Buffer | null> {
  try {
    return await readFile(path.join(sessionDir(id), name));
  } catch {
    return null;
  }
}
