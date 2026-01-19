import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stripHTML = (html?: string): string => {
  if (!html) return "";

  return (
    html
      // 1️⃣ empty <p></p> → line break
      .replace(/<p>\s*<\/p>/gi, "\n")

      // 2️⃣ <p>&nbsp;</p> → line break
      .replace(/<p>(&nbsp;|\s)*<\/p>/gi, "\n")

      // 3️⃣ <p><br></p> → line break
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "\n")

      // 4️⃣ closing </p> → line break
      .replace(/<\/p>/gi, "\n")

      // 5️⃣ remove opening <p> tags
      .replace(/<p[^>]*>/gi, "")

      // 6️⃣ strip all remaining HTML
      .replace(/<[^>]+>/g, "")

      // 7️⃣ normalize multiple line breaks
      .replace(/\n{3,}/g, "\n\n")

      .trim()
  );
};

export const normalizeHTML = (html?: string): string => {
  if (!html) return "";

  return html
    // empty paragraph → line break
    .replace(/<p>\s*<\/p>/gi, "<br/>")

    // paragraph with only &nbsp;
    .replace(/<p>(&nbsp;|\s)*<\/p>/gi, "<br/>")

    // paragraph with <br>
    .replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, "<br/>");
};

// src/lib/utils/parseApiLink.ts
export function parseApiLink(link: string): {
  resource: string;
  filter?: Record<string, any>;
} | null {
  if (!link) return null;

  try {
    const [path, query] = link.split("?");
    const resource = path.replace("/", ""); // "monuments", "subthemes"

    if (!query) return { resource };

    const params = new URLSearchParams(query);
    const filterParam = params.get("filter");

    const filter = filterParam ? JSON.parse(filterParam) : undefined;

    return { resource, filter };
  } catch (err) {
    console.error("Invalid API link:", link, err);
    return null;
  }
}

export const getDistanceInMeters = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
