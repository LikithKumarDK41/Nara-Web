// utils/monumentSort.ts
import type { Monument } from "@/lib/types/userTour.types";

export function sortByPopularityThenName(list: Monument[]) {
  return [...list].sort((a, b) => {
    const p1 = a.popularity ?? 0;
    const p2 = b.popularity ?? 0;

    // 🔥 popularity DESC (人気順)
    if (p1 !== p2) return p2 - p1;

    // 🔁 fallback: name ASC (A → Z)
    const n1 = (a.name || a.title || "").toLowerCase();
    const n2 = (b.name || b.title || "").toLowerCase();

    return n1.localeCompare(n2);
  });
}
