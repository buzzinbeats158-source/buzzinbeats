import "server-only";
import QRCode from "qrcode";
import { Jimp } from "jimp";

/**
 * Mirrors Laravel PageController::downloadQrCode()/previewQrCode()
 * (simplesoftwareio/simple-qrcode): error correction level H, optional
 * hex foreground color, optional center-logo merge at a 0.22 size ratio.
 * Generated in-memory per request, never persisted — same as the
 * Laravel behavior (see migration plan section 9).
 */

type QrOptions = {
  colorHex?: string | null; // e.g. "#1a2b3c"
  logoBuffer?: Buffer | null;
};

export async function generateQrPng(url: string, { colorHex, logoBuffer }: QrOptions = {}) {
  const size = 1000;
  const qrBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: size,
    errorCorrectionLevel: "H",
    color: {
      dark: normalizeHex(colorHex) ?? "#000000ff",
      light: "#ffffffff",
    },
  });

  if (!logoBuffer) return qrBuffer;

  // 0.22 ratio, centered — matches simple-qrcode's merge(logoPath, 0.22, true)
  const logoSize = Math.round(size * 0.22);
  const [qrImage, logoImage] = await Promise.all([
    Jimp.fromBuffer(qrBuffer),
    Jimp.fromBuffer(logoBuffer),
  ]);
  logoImage.resize({ w: logoSize, h: logoSize });
  qrImage.composite(logoImage, (size - logoSize) / 2, (size - logoSize) / 2);

  return qrImage.getBuffer("image/png");
}

export async function generateQrSvg(url: string, { colorHex }: QrOptions = {}) {
  return QRCode.toString(url, {
    type: "svg",
    width: 500,
    errorCorrectionLevel: "H",
    color: {
      dark: normalizeHex(colorHex) ?? "#000000ff",
      light: "#ffffffff",
    },
  });
}

function normalizeHex(hex?: string | null) {
  if (!hex) return null;
  const clean = hex.startsWith("#") ? hex : `#${hex}`;
  return clean.length === 7 ? `${clean}ff` : clean; // qrcode lib wants #RRGGBBAA
}
