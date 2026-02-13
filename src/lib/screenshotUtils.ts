import { toPng } from "html-to-image";

export interface ScreenshotOptions {
  scale?: number;
  quality?: number;
  pixelRatio?: number;
}

/**
 * Disable external stylesheets (especially fonts) before screenshot
 * to avoid CORS errors and use system default fonts
 */
function disableExternalStylesheets(): HTMLLinkElement[] {
  const disabled: HTMLLinkElement[] = [];
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')) as HTMLLinkElement[];
  
  for (const link of links) {
    const href = link.getAttribute('href');
    if (href) {
      try {
        const linkUrl = new URL(href, location.href);
        // Disable external stylesheets (different origin)
        if (linkUrl.origin !== location.origin) {
          link.disabled = true;
          disabled.push(link);
        }
      } catch {
        // Skip invalid URLs
      }
    }
  }
  return disabled;
}

function restoreExternalStylesheets(links: HTMLLinkElement[]): void {
  for (const link of links) {
    link.disabled = false;
  }
}

/**
 * Capture element as PNG and download
 */
export async function downloadScreenshot(
  elementId: string,
  filename: string = "screenshot.png",
  options: ScreenshotOptions = {},
  mapCanvasDataUrl?: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Inject Mapbox canvas as image
    let mapImageElement: HTMLImageElement | null = null;
    if (mapCanvasDataUrl) {
      const canvases = Array.from(element.querySelectorAll("canvas"));
      if (canvases.length > 0) {
        const canvas = canvases[0] as HTMLCanvasElement;
        mapImageElement = document.createElement("img");
        mapImageElement.src = mapCanvasDataUrl;
        mapImageElement.style.width = `${canvas.width}px`;
        mapImageElement.style.height = `${canvas.height}px`;
        mapImageElement.style.position = "absolute";
        mapImageElement.style.left = "0";
        mapImageElement.style.top = "0";
        mapImageElement.style.zIndex = "0";
        mapImageElement.style.display = "block";
        canvas.parentNode?.insertBefore(mapImageElement, canvas);
        canvas.style.visibility = "hidden";
      }
    }

    // Temporarily remove background and borders
    const originalBg = element.style.backgroundColor;
    const originalBorder = element.style.border;
    element.style.backgroundColor = "transparent";
    element.style.border = "none";

    let image: string | null = null;
    const disabledLinks = disableExternalStylesheets();
    try {
      try {
        image = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2,
          width: element.offsetWidth,
          height: element.offsetHeight,
          backgroundColor: "transparent",
        });

        // Download
        const link = document.createElement("a");
        link.href = image;
        link.download = filename;
        link.click();
      } finally {
        restoreExternalStylesheets(disabledLinks);
      }
    } finally {
      // Restore
      element.style.backgroundColor = originalBg;
      element.style.border = originalBorder;
      if (mapImageElement) {
        mapImageElement.remove();
        const canvases = Array.from(element.querySelectorAll("canvas"));
        if (canvases.length > 0) {
          (canvases[0] as HTMLCanvasElement).style.visibility = "";
        }
      }
    }
  } catch (error) {
    console.error("Screenshot download failed:", error);
    throw new Error("Failed to download screenshot");
  }
}

/**
 * Share screenshot using Web Share API (mobile)
 */
export async function shareScreenshot(
  elementId: string,
  filename: string = "screenshot.png",
  shareData: { title?: string; text?: string } = {},
  mapCanvasDataUrl?: string
): Promise<void> {
  try {
    // Check if Web Share API is available
    if (!navigator.share) {
      throw new Error("Web Share API not supported");
    }

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Inject Mapbox canvas as image
    let mapImageElement: HTMLImageElement | null = null;
    if (mapCanvasDataUrl) {
      const canvases = Array.from(element.querySelectorAll("canvas"));
      if (canvases.length > 0) {
        const canvas = canvases[0] as HTMLCanvasElement;
        mapImageElement = document.createElement("img");
        mapImageElement.src = mapCanvasDataUrl;
        mapImageElement.style.width = `${canvas.width}px`;
        mapImageElement.style.height = `${canvas.height}px`;
        mapImageElement.style.position = "absolute";
        mapImageElement.style.left = "0";
        mapImageElement.style.top = "0";
        mapImageElement.style.zIndex = "0";
        mapImageElement.style.display = "block";
        canvas.parentNode?.insertBefore(mapImageElement, canvas);
        canvas.style.visibility = "hidden";
      }
    }

    // Temporarily remove background and borders
    const originalBg = element.style.backgroundColor;
    const originalBorder = element.style.border;
    element.style.backgroundColor = "transparent";
    element.style.border = "none";

    let image: string | null = null;
    const disabledLinks = disableExternalStylesheets();
    try {
      try {
        image = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2,
          width: element.offsetWidth,
          height: element.offsetHeight,
          backgroundColor: "transparent",
        });

        // Convert data URL to blob and share
        const response = await fetch(image);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: "image/png" });

        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({
            ...shareData,
            files: [file],
          });
        } else {
          throw new Error("Sharing files is not supported");
        }
      } finally {
        restoreExternalStylesheets(disabledLinks);
      }
    } finally {
      // Restore
      element.style.backgroundColor = originalBg;
      element.style.border = originalBorder;
      if (mapImageElement) {
        mapImageElement.remove();
        const canvases = Array.from(element.querySelectorAll("canvas"));
        if (canvases.length > 0) {
          (canvases[0] as HTMLCanvasElement).style.visibility = "";
        }
      }
    }
  } catch (error) {
    console.error("Screenshot share failed:", error);
    throw new Error("Failed to share screenshot");
  }
}

export async function copyScreenshotToClipboard(
  elementId: string,
  mapCanvasDataUrl?: string
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Inject Mapbox canvas as image
    let mapImageElement: HTMLImageElement | null = null;
    if (mapCanvasDataUrl) {
      const canvases = Array.from(element.querySelectorAll("canvas"));
      if (canvases.length > 0) {
        const canvas = canvases[0] as HTMLCanvasElement;
        mapImageElement = document.createElement("img");
        mapImageElement.src = mapCanvasDataUrl;
        mapImageElement.style.width = `${canvas.width}px`;
        mapImageElement.style.height = `${canvas.height}px`;
        mapImageElement.style.position = "absolute";
        mapImageElement.style.left = "0";
        mapImageElement.style.top = "0";
        mapImageElement.style.zIndex = "0";
        mapImageElement.style.display = "block";
        canvas.parentNode?.insertBefore(mapImageElement, canvas);
        canvas.style.visibility = "hidden";
      }
    }

    // Temporarily remove background and borders
    const originalBg = element.style.backgroundColor;
    const originalBorder = element.style.border;
    element.style.backgroundColor = "transparent";
    element.style.border = "none";

    let image: string | null = null;
    const disabledLinks = disableExternalStylesheets();
    try {
      try {
        image = await toPng(element, {
          cacheBust: true,
          pixelRatio: 2,
          width: element.offsetWidth,
          height: element.offsetHeight,
          backgroundColor: "transparent",
        });

        // Convert and copy to clipboard
        const response = await fetch(image);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } finally {
        restoreExternalStylesheets(disabledLinks);
      }
    } finally {
      // Restore
      element.style.backgroundColor = originalBg;
      element.style.border = originalBorder;
      if (mapImageElement) {
        mapImageElement.remove();
        const canvases = Array.from(element.querySelectorAll("canvas"));
        if (canvases.length > 0) {
          (canvases[0] as HTMLCanvasElement).style.visibility = "";
        }
      }
    }
  } catch (error) {
    console.error("Copy to clipboard failed:", error);
    throw new Error("Failed to copy screenshot");
  }
}
