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
