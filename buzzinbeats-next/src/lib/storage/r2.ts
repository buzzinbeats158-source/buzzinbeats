import "server-only";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let client: S3Client | null = null;

function r2Client() {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return client;
}

/** Uploads to the public bucket (served via assets.buzzinbeats.com — every
 * object in this bucket is publicly readable, so only non-sensitive images
 * belong here). Returns the object key to store in the DB. */
export async function uploadPublicObject(key: string, body: Buffer, contentType: string) {
  await r2Client().send(
    new PutObjectCommand({ Bucket: process.env.R2_PUBLIC_BUCKET!, Key: key, Body: body, ContentType: contentType }),
  );
  return key;
}

/** Uploads to the private bucket (no public custom domain — only reachable
 * via presigned URLs generated server-side after an access check). */
export async function uploadPrivateObject(key: string, body: Buffer, contentType: string) {
  await r2Client().send(
    new PutObjectCommand({ Bucket: process.env.R2_PRIVATE_BUCKET!, Key: key, Body: body, ContentType: contentType }),
  );
  return key;
}

/** Mirrors the previous Supabase createSignedUrl() call — same 15-minute
 * default expiry, same "generate right before redirecting" usage pattern. */
export async function getPrivateSignedUrl(key: string, expiresInSeconds = 15 * 60) {
  const command = new GetObjectCommand({ Bucket: process.env.R2_PRIVATE_BUCKET!, Key: key });
  return getSignedUrl(r2Client(), command, { expiresIn: expiresInSeconds });
}

export async function downloadPublicObject(key: string): Promise<Buffer> {
  const res = await r2Client().send(new GetObjectCommand({ Bucket: process.env.R2_PUBLIC_BUCKET!, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

export async function deletePublicObject(key: string) {
  await r2Client().send(new DeleteObjectCommand({ Bucket: process.env.R2_PUBLIC_BUCKET!, Key: key }));
}

export async function deletePrivateObject(key: string) {
  await r2Client().send(new DeleteObjectCommand({ Bucket: process.env.R2_PRIVATE_BUCKET!, Key: key }));
}

export async function downloadPrivateObject(key: string): Promise<Buffer> {
  const res = await r2Client().send(new GetObjectCommand({ Bucket: process.env.R2_PRIVATE_BUCKET!, Key: key }));
  const bytes = await res.Body!.transformToByteArray();
  return Buffer.from(bytes);
}

export async function getPrivateSignedDownloadUrl(key: string, filename: string, expiresInSeconds = 5 * 60) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_PRIVATE_BUCKET!,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${filename}"`,
  });
  return getSignedUrl(r2Client(), command, { expiresIn: expiresInSeconds });
}

/** Lists every object across both buckets (used for the "Files" backup
 * manifest — an inventory snapshot, not a byte-for-byte copy, since
 * duplicating an entire object-storage bucket on every backup run would be
 * prohibitively expensive in bandwidth/storage). */
export async function listAllObjects() {
  const buckets = [
    { name: "public", bucket: process.env.R2_PUBLIC_BUCKET! },
    { name: "private", bucket: process.env.R2_PRIVATE_BUCKET! },
  ];
  const result: { bucket: string; key: string; size: number; lastModified: string | null; etag: string | null }[] = [];

  for (const { name, bucket } of buckets) {
    let continuationToken: string | undefined;
    do {
      const res = await r2Client().send(new ListObjectsV2Command({ Bucket: bucket, ContinuationToken: continuationToken }));
      for (const obj of res.Contents ?? []) {
        result.push({
          bucket: name,
          key: obj.Key ?? "",
          size: obj.Size ?? 0,
          lastModified: obj.LastModified?.toISOString() ?? null,
          etag: obj.ETag ?? null,
        });
      }
      continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
    } while (continuationToken);
  }

  return result;
}
