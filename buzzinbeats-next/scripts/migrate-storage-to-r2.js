#!/usr/bin/env node
// One-time migration: copies existing Supabase Storage ("public-uploads"
// bucket) images to Cloudflare R2, converting to WebP, and repoints the DB
// path columns. Read-only against Supabase until the final UPDATE per row;
// does not delete the original Supabase objects (kept as a rollback safety
// net). Usage: node scripts/migrate-storage-to-r2.js [--dry-run]
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");
const sharp = require("sharp");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const crypto = require("crypto");

const dryRun = process.argv.includes("--dry-run");

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY },
});

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

async function downloadFromSupabase(path) {
  const url = `${SUPABASE_URL}/storage/v1/object/public/public-uploads/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Supabase fetch ${res.status} for ${path}`);
  return Buffer.from(await res.arrayBuffer());
}

async function migrateRow({ table, id, pathColumn, oldPath, folder, width, height }) {
  if (!oldPath) return { skipped: "no path" };
  if (/^https?:\/\//i.test(oldPath)) return { skipped: "already external URL" };
  if (oldPath.startsWith(`${folder}/`) && oldPath.endsWith(".webp")) return { skipped: "already migrated" };

  const raw = await downloadFromSupabase(oldPath);
  const webp = await sharp(raw).resize(width, height, { fit: "cover", position: "centre" }).webp({ quality: 80 }).toBuffer();
  const newKey = `${folder}/${crypto.randomUUID()}.webp`;

  if (!dryRun) {
    await r2.send(new PutObjectCommand({ Bucket: process.env.R2_PUBLIC_BUCKET, Key: newKey, Body: webp, ContentType: "image/webp" }));
  }
  return { oldPath, newKey, bytesBefore: raw.length, bytesAfter: webp.length, table, id, pathColumn };
}

(async () => {
  const pg = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  const results = { migrated: [], skipped: [], failed: [] };

  const jobs = [
    { table: "products", pathColumn: "image_path", folder: "products", width: 800, height: 800 },
    { table: "redirect_links", pathColumn: "image_path", folder: "redirect-links", width: 1280, height: 800 },
    { table: "digital_products", pathColumn: "cover_image_path", folder: "digital-products", width: 1280, height: 720 },
  ];

  for (const job of jobs) {
    const { rows } = await pg.query(`SELECT id, ${job.pathColumn} AS old_path FROM ${job.table} WHERE ${job.pathColumn} IS NOT NULL`);
    console.log(`\n=== ${job.table} (${rows.length} rows with ${job.pathColumn}) ===`);

    for (const row of rows) {
      try {
        const result = await migrateRow({
          table: job.table,
          id: row.id,
          pathColumn: job.pathColumn,
          oldPath: row.old_path,
          folder: job.folder,
          width: job.width,
          height: job.height,
        });

        if (result.skipped) {
          results.skipped.push({ table: job.table, id: row.id, reason: result.skipped });
          console.log(`  [skip] id=${row.id} — ${result.skipped}`);
          continue;
        }

        if (!dryRun) {
          await pg.query(`UPDATE ${job.table} SET ${job.pathColumn} = $1 WHERE id = $2`, [result.newKey, row.id]);
        }
        results.migrated.push(result);
        console.log(`  [ok] id=${row.id} — ${result.oldPath} -> ${result.newKey} (${result.bytesBefore}B -> ${result.bytesAfter}B)`);
      } catch (e) {
        results.failed.push({ table: job.table, id: row.id, oldPath: row.old_path, error: e.message });
        console.log(`  [FAIL] id=${row.id} — ${e.message}`);
      }
    }
  }

  await pg.end();

  console.log(`\n=== Summary${dryRun ? " (DRY RUN — no writes performed)" : ""} ===`);
  console.log(`Migrated: ${results.migrated.length}, Skipped: ${results.skipped.length}, Failed: ${results.failed.length}`);
  if (results.failed.length) {
    console.log("Failures:", JSON.stringify(results.failed, null, 2));
    process.exitCode = 1;
  }
})();
