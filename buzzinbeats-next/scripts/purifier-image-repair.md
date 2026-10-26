Purifier product image recovery (26 October 2026)

Page: https://buzzinbeats.com/ballu/homemade-ro-uv-uf-tds-mtds-purifier

Products 28–35 retained Laravel upload paths under `uploads/users/1/products/`.
Those objects were absent from R2, so the public URLs returned 404. The current
Amazon import code stores external image URLs, but does not repair legacy rows.

Recovered seven image URLs from their Amazon product pages. ASIN B07JDC7B4X
returned 404; its original Amazon CDN image was recovered from the image link
on the matching ASIN listing:
https://www.desertcart.in/products/105507446-aquafresh-pokar-ro-11w-uv-set-11w-philips-lamp-tube
The recovered image was visually checked against the UV chamber/lamp/adaptor kit.

Run from the app directory:

    node scripts/repair-amazon-images.cjs --page-id 55 --image-map scripts/purifier-image-map.json

Add `--apply` to save verified replacements. The script only replaces missing
legacy images, validates image responses and dimensions, backs up old paths in
`.next/image-repair-backups`, and guards updates against concurrent changes.
Working existing files and external image URLs are skipped. It never substitutes
a different product when a listing is unavailable.

All eight live image paths were repaired. Database readback and browser checks
confirmed that every product image loaded successfully. No app deployment needed.
