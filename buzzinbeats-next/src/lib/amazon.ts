import "server-only";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Port of Laravel AmazonService — Amazon Product Advertising API 5.0,
 * signed with AWS Signature V4 (hand-rolled, matching the original byte
 * for byte: same canonical-request construction, same header set, same
 * signing-key derivation chain).
 */

type ItemInfo = {
  title: string;
  image: string | null;
  description: string;
  price: number | null;
  currency: string;
};

async function getCredentials() {
  let accessKey = process.env.AMAZON_ACCESS_KEY;
  let secretKey = process.env.AMAZON_SECRET_KEY;
  let region = process.env.AMAZON_REGION;
  let host = process.env.AMAZON_HOST;

  if (!accessKey || !secretKey) {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("system_settings")
      .select("key, value")
      .in("key", ["amazon_access_key", "amazon_secret_key", "amazon_region", "amazon_host"]);
    const map = Object.fromEntries((data ?? []).map((s) => [s.key, s.value]));
    accessKey = accessKey || map.amazon_access_key;
    secretKey = secretKey || map.amazon_secret_key;
    region = region || map.amazon_region;
    host = host || map.amazon_host;
  }

  return {
    accessKey,
    secretKey,
    region: region || "eu-west-1",
    host: host || "webservices.amazon.in",
  };
}

function signRequest(params: {
  accessKey: string;
  secretKey: string;
  region: string;
  host: string;
  operation: string;
  payload: object;
}) {
  const { accessKey, secretKey, region, host, operation, payload } = params;
  const service = "ProductAdvertisingAPI";
  const path = `/paapi5/${operation.toLowerCase()}`;
  const payloadJson = JSON.stringify(payload);
  const payloadHash = crypto.createHash("sha256").update(payloadJson).digest("hex");

  const now = new Date();
  const timestamp = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // YYYYMMDDTHHMMSSZ
  const date = timestamp.slice(0, 8);

  const headers: Record<string, string> = {
    "content-type": "application/json; charset=utf-8",
    host,
    "x-amz-date": timestamp,
    "x-amz-content-sha256": payloadHash,
    "x-amz-target": `com.amazon.paapi5.v1.ProductAdvertisingAPIv1.${operation}`,
    "content-encoding": "amz-1.0",
  };

  const sortedKeys = Object.keys(headers).sort();
  const canonicalHeaders = sortedKeys.map((k) => `${k}:${headers[k]}\n`).join("");
  const signedHeaders = sortedKeys.join(";");

  const canonicalRequest = `POST\n${path}\n\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const credentialScope = `${date}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${timestamp}\n${credentialScope}\n${crypto
    .createHash("sha256")
    .update(canonicalRequest)
    .digest("hex")}`;

  const hmac = (key: Buffer | string, data: string) => crypto.createHmac("sha256", key).update(data).digest();
  const kDate = hmac(`AWS4${secretKey}`, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, "aws4_request");
  const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  headers.Authorization = `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { path, headers, payloadJson };
}

function friendlyError(status: number, body: string): string {
  let detailed: string | null = null;
  try {
    const json = JSON.parse(body);
    detailed = json?.Errors?.[0]?.Message ?? json?.Message ?? json?.message ?? null;
  } catch {
    // body wasn't JSON
  }
  if (detailed) return `Amazon PA-API Error: ${detailed}`;
  if (body.includes("UnrecognizedClient")) return "Amazon credentials are invalid or not enabled for Product Advertising API.";
  if (body.includes("InvalidSignature")) return "Amazon request signature is invalid. Please verify Access Key/Secret Key/Region and try again.";
  if (body.includes("TooManyRequests")) return "Amazon API rate limit exceeded. Please try again shortly.";
  if (body.includes("AccessDenied")) return "Amazon Product Advertising API access is denied for these credentials.";
  return `Failed to connect to Amazon Product Advertising API (HTTP ${status}).`;
}

export async function getItemInfo(asin: string, partnerTag: string): Promise<{ data: ItemInfo | null; error: string | null }> {
  const { accessKey, secretKey, region, host } = await getCredentials();
  if (!accessKey || !secretKey) {
    return { data: null, error: "Amazon API credentials are missing." };
  }

  const payload = {
    ItemIds: [asin],
    Resources: ["ItemInfo.Title", "ItemInfo.Features", "Images.Primary.Large", "Offers.Listings.Price"],
    PartnerTag: partnerTag,
    PartnerType: "Associates",
    Marketplace: "www.amazon.in",
  };

  const { path, headers, payloadJson } = signRequest({ accessKey, secretKey, region, host, operation: "GetItems", payload });

  try {
    const res = await fetch(`https://${host}${path}`, { method: "POST", headers, body: payloadJson });
    const text = await res.text();
    if (!res.ok) return { data: null, error: friendlyError(res.status, text) };

    const result = JSON.parse(text);
    const item = result?.ItemsResult?.Items?.[0];
    if (!item) return { data: null, error: "No item found for this ASIN." };

    return {
      data: {
        title: item.ItemInfo?.Title?.DisplayValue ?? "No Title",
        image: item.Images?.Primary?.Large?.URL ?? null,
        description: item.ItemInfo?.Features?.DisplayValues?.join("\n") ?? "No description available",
        price: item.Offers?.Listings?.[0]?.Price?.Amount ?? null,
        currency: item.Offers?.Listings?.[0]?.Price?.Currency ?? "INR",
      },
      error: null,
    };
  } catch (e) {
    return { data: null, error: e instanceof Error ? e.message : "Failed to connect to Amazon Product Advertising API." };
  }
}
