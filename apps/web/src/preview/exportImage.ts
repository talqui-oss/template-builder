import { domToJpeg, domToPng, domToWebp } from "modern-screenshot";

export type ImageFormat = "png" | "jpg" | "webp";

// The preview is laid out in iOS points, so 3x gives the pixel size of a real iPhone screenshot.
const SCALE = 3;

const RENDERERS = {
  png: (node: HTMLElement) => domToPng(node, { scale: SCALE }),
  jpg: (node: HTMLElement) => domToJpeg(node, { scale: SCALE, quality: 0.95 }),
  webp: (node: HTMLElement) => domToWebp(node, { scale: SCALE, quality: 0.95 }),
};

/** Renders the node to an image and starts a download. */
export async function downloadImage(
  node: HTMLElement,
  format: ImageFormat,
  name: string,
) {
  const link = document.createElement("a");
  link.href = await RENDERERS[format](node);
  link.download = `${name || "template"}.${format}`;
  link.click();
}
