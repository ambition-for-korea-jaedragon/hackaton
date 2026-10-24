import type { Area, Product } from "@/lib/types";

export const AREA_LABEL: Record<Area, string> = { skincare: "Skin", base: "Base", eye: "Eye", blush: "Blush", lip: "Lip" };
export const AREA_ORDER: Area[] = ["skincare", "base", "eye", "blush", "lip"];

export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => AREA_ORDER.indexOf(a.area) - AREA_ORDER.indexOf(b.area));
}

export const productTitle = (p: Product) => `${p.brand} ${p.name}`.trim();
