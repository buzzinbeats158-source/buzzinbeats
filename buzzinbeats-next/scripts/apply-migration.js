#!/usr/bin/env node
// Applies a SQL migration file against Supabase via SUPABASE_DB_URL
// (session pooler — see .env.local). Usage: node scripts/apply-migration.js supabase/migrations/000X_name.sql
require("dotenv").config({ path: ".env.local" });
const { Client } = require("pg");
const fs = require("fs");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/apply-migration.js <path-to-sql-file>");
  process.exit(1);
}

(async () => {
  const client = new Client({
    connectionString: process.env.SUPABASE_DB_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const sql = fs.readFileSync(file, "utf8");
  await client.query(sql);
  console.log(`Applied: ${file}`);
  await client.end();
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
