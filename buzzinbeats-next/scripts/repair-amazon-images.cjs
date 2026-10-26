// Dry run: node scripts/repair-amazon-images.cjs --page-id 55
// Save verified repairs: add --apply. Original paths are backed up first.
require('dotenv').config({ path: '.env.local', quiet: true });
const { Client } = require('pg');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

function amazonImage(html) {
  const tag = html.match(/<img\b[^>]*\bid=["']landingImage["'][^>]*>/i)?.[0];
  if (!tag) throw new Error('Amazon product image was not found; no change made');
  const image = tag.match(/\bdata-old-hires=["']([^"']+)["']/i)?.[1]
    || tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
  const url = new URL(image);
  if (url.protocol !== 'https:' || !['m.media-amazon.com', 'images-na.ssl-images-amazon.com'].includes(url.hostname)) {
    throw new Error('Unexpected Amazon image host');
  }
  return url.href;
}

async function checkedFetch(url) {
  return fetch(url, { signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0' } });
}

async function main() {
  const args = process.argv.slice(2);
  const pageIndex = args.indexOf('--page-id');
  const pageId = pageIndex >= 0 ? Number(args[pageIndex + 1]) : NaN;
  if (!Number.isSafeInteger(pageId) || pageId <= 0) throw new Error('Specify a valid --page-id');
  const apply = args.includes('--apply');
  const mapIndex = args.indexOf('--image-map');
  const imageMap = mapIndex >= 0 ? JSON.parse(await fs.readFile(args[mapIndex + 1], 'utf8')) : {};
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
  if (!base) throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL is required');
  const db = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
  await db.connect();
  try {
    const { rows } = await db.query('SELECT id, title, image_path, link FROM products WHERE page_id = $1 ORDER BY id', [pageId]);
    const repairs = [];
    const failures = [];
    for (const row of rows) {
      try {
      // External URLs and new uploads remain untouched.
      if (!row.image_path?.startsWith('uploads/users/')) continue;
      const links = typeof row.link === 'string' ? JSON.parse(row.link) : row.link;
      const amazon = (Array.isArray(links) ? links : []).find(link => {
        try { return new URL(link).hostname === 'www.amazon.in'; } catch { return false; }
      });
      if (!amazon) continue;
      const asin = new URL(amazon).pathname.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:\/|$)/i)?.[1];
      if (!asin) throw new Error(`Product ${row.id}: no valid Amazon ASIN`);
      const existing = await checkedFetch(`${base.replace(/\/$/, '')}/${row.image_path}`);
      await existing.body?.cancel();
      if (existing.ok) { console.log(`Product ${row.id}: existing image works; skipped`); continue; }
      if (existing.status !== 404) throw new Error(`Product ${row.id}: storage returned ${existing.status}; refusing to replace`);
      let image;
      if (imageMap[asin]) {
        // Operator-verified CDN references can recover discontinued listings.
        image = amazonImage(`<img id="landingImage" src="${imageMap[asin]}">`);
      } else {
        const product = await checkedFetch(`https://www.amazon.in/dp/${asin}`);
        if (!product.ok) throw new Error(`Product ${row.id}: Amazon returned ${product.status}`);
        image = amazonImage(await product.text());
      }
      const response = await checkedFetch(image);
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) {
        throw new Error(`Product ${row.id}: replacement image is unavailable`);
      }
      const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
      if (!metadata.width || !metadata.height || metadata.width < 100 || metadata.height < 100) {
        throw new Error(`Product ${row.id}: replacement is not a usable product image`);
      }
      repairs.push({ id: row.id, title: row.title, oldPath: row.image_path, newPath: image, asin });
      console.log(`Product ${row.id}: verified Amazon image (${metadata.width}x${metadata.height})`);
      } catch (error) {
        failures.push({ id: row.id, error: error.message });
        console.log(`Product ${row.id}: ${error.message}`);
      }
    }
    if (failures.length) {
      console.log('Unresolved:', JSON.stringify(failures));
      process.exitCode = 1;
    }
    if (!repairs.length) { console.log('No missing Amazon images to repair'); return; }
    const backupDir = path.join('.next', 'image-repair-backups');
    await fs.mkdir(backupDir, { recursive: true });
    const backup = path.join(backupDir, `page-${pageId}-${Date.now()}.json`);
    await fs.writeFile(backup, JSON.stringify({ pageId, repairs }, null, 2), { flag: 'wx' });
    console.log(`Backup: ${backup}`);
    if (!apply) { console.log(`Dry run: ${repairs.length} verified repairs; use --apply to save`); return; }
    await db.query('BEGIN');
    try {
      for (const repair of repairs) {
        const result = await db.query(
          'UPDATE products SET image_path = $1 WHERE id = $2 AND page_id = $3 AND image_path = $4 RETURNING image_path',
          [repair.newPath, repair.id, pageId, repair.oldPath]);
        if (result.rowCount !== 1) throw new Error(`Product ${repair.id} changed during repair; rolling back`);
      }
      await db.query('COMMIT');
    } catch (error) { await db.query('ROLLBACK'); throw error; }
    const verified = await db.query('SELECT id, image_path FROM products WHERE page_id = $1', [pageId]);
    for (const repair of repairs) {
      if (!verified.rows.some(row => row.id === repair.id && row.image_path === repair.newPath)) {
        throw new Error(`Product ${repair.id}: database verification failed`);
      }
    }
    console.log(`Repaired and verified ${repairs.length} product images`);
  } finally { await db.end(); }
}

module.exports = { amazonImage };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
