import "server-only";
import raw from "@/data/catalog.json";
import { CatalogItem } from "./types";
import { z } from "zod";

// SAMPLE catalog (not verified against physical products).
export const catalog: CatalogItem[] = z.array(CatalogItem).parse(raw);

export function getCatalogItems(ids: string[]): CatalogItem[] {
  const map = new Map(catalog.map((c) => [c.id, c]));
  return ids.map((i) => map.get(i)).filter((x): x is CatalogItem => !!x);
}
