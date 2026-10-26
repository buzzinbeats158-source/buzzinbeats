import "server-only";
import sharp from "sharp";

const TARGET_BYTES = 200 * 1024;
const MIN_QUALITY = 40;
const QUALITY_STEP = 10;

/** Resizes (cover-crop) and re-encodes to WebP, stepping quality down until
 * the output is at or under ~200KB (thumbnails don't need much detail) or
 * quality would drop below a floor that starts visibly degrading the image. */
export async function resizeToWebp(input: Buffer, width: number, height: number, startQuality = 80): Promise<Buffer> {
  const resized = sharp(input).resize(width, height, { fit: "cover", position: "centre" });

  let quality = startQuality;
  let output = await resized.clone().webp({ quality }).toBuffer();

  while (output.length > TARGET_BYTES && quality > MIN_QUALITY) {
    quality -= QUALITY_STEP;
    output = await resized.clone().webp({ quality }).toBuffer();
  }

  return output;
}
