"use client";
// Compute callout pin anchors (normalized 0..1) on a face photo with MediaPipe Face Landmarker.
// Runs fully in the browser; wasm + model are self-hosted under /mediapipe and /models.
import { useEffect, useState } from "react";
import type { AreaPoints } from "@/lib/types";

type Landmarker = import("@mediapipe/tasks-vision").FaceLandmarker;
let landmarker: Promise<Landmarker> | null = null;

function getLandmarker() {
  landmarker ??= (async () => {
    const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
    return FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: "/models/face_landmarker.task" },
      runningMode: "IMAGE",
      numFaces: 1,
    });
  })();
  return landmarker;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = () => rej(new Error("image failed to load"));
    img.src = src;
  });
}

const avg = (pts: { x: number; y: number }[]) => ({
  x: pts.reduce((a, p) => a + p.x, 0) / pts.length,
  y: pts.reduce((a, p) => a + p.y, 0) / pts.length,
});

export async function computeFacePoints(src: string): Promise<AreaPoints | null> {
  const [lm, img] = await Promise.all([getLandmarker(), loadImage(src)]);
  const r = lm.detect(img);
  const f = r.faceLandmarks[0];
  if (!f) return null;
  const p = (...i: number[]) => avg(i.map((k) => f[k]));
  const nose = f[1];
  const pull = (c: { x: number; y: number }, dy: number) => ({ x: c.x + (nose.x - c.x) * 0.25, y: nose.y + dy });
  return {
    skincare: p(10, 151, 9), // forehead center
    base: pull(f[205], 0.004), // image-left cheek beside the nose
    eye: p(159, 158, 160), // upper eyelid center, image-left eye
    blush: pull(f[425], -0.012), // apple of the image-right cheek
    lip: p(13, 14), // lip center
  };
}

// Returns stored points if present, else computes them from the image; null while loading or if no face found.
export function useFacePoints(src: string | undefined, stored?: AreaPoints): AreaPoints | null {
  const [computed, setComputed] = useState<AreaPoints | null>(null);
  useEffect(() => {
    if (stored || !src) return;
    let alive = true;
    computeFacePoints(src)
      .then((p) => alive && setComputed(p))
      .catch((e) => console.error("[face-points]", e));
    return () => {
      alive = false;
    };
  }, [src, stored]);
  return stored ?? computed;
}
