// Run: node --test scripts/test-permanent-page-urls.cjs
// Exercises real application modules with an in-memory database boundary.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function loadModule(relativePath, dependencies = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      throw new Error(`Unexpected dependency: ${name}`);
    },
    process: { env: {} },
    Date, Promise, URL,
  }, { filename });
  return exports;
}

const urls = loadModule("src/lib/public-page-url.ts");

function database(tables) {
  const updates = [];
  return {
    updates,
    from(table) {
      const filters = [];
      let mutation = false;
      const query = {
        select() { return query; },
        eq(key, value) { filters.push((row) => row[key] === value); return query; },
        is(key, value) { return query.eq(key, value); },
        order() { return query; },
        update(values) { updates.push({ table, values }); mutation = true; return query; },
        insert() { mutation = true; return query; },
        async maybeSingle() {
          const matches = (tables[table] ?? []).filter((row) => filters.every((f) => f(row)));
          assert.ok(matches.length <= 1, `Ambiguous ${table} lookup`);
          return { data: matches[0] ?? null };
        },
        then(resolve, reject) {
          return Promise.resolve({ data: mutation ? null : (tables[table] ?? []).filter((row) => filters.every((f) => f(row))) }).then(resolve, reject);
        },
      };
      return query;
    },
  };
}

function publicLoader(tables) {
  return loadModule("src/lib/data/public-page.ts", {
    "server-only": {},
    "next/headers": { headers: async () => new Map() },
    "@/lib/supabase/admin": { createAdminClient: () => database(tables) },
    "@/lib/analytics": { detectDeviceType: () => "desktop" },
  }).loadPublicPage;
}

function fixture() {
  return {
    users: [{ id: 1, name: "New Name", bypass_subscription: true }],
    pages: [{ id: 10, user_id: 1, public_username: "Old Name", slug: "menu", is_published: true, status: "active", deleted_at: null }],
  };
}

test("a renamed account keeps its old link and newly downloaded QR destination", async () => {
  const tables = fixture();
  const result = await publicLoader(tables)("Old Name", "menu");
  assert.equal(result.kind, "ok");
  assert.equal(result.owner.name, "New Name");
  assert.equal(urls.publicPageUrl(result.page, "https://buzzinbeats.com/"), "https://buzzinbeats.com/Old%20Name/menu");

  let qrDestination;
  const qr = loadModule("src/app/api/pages/[id]/qr-code/route.ts", {
    "next/server": { NextResponse: class { constructor(body, options) { this.body = body; this.options = options; } } },
    "@/lib/data/current-user": { getCurrentUser: async () => tables.users[0] },
    "@/lib/supabase/server": { createClient: async () => database(tables) },
    "@/lib/qr": { generateQrSvg: async (url) => { qrDestination = url; return "<svg/>"; } },
    "@/lib/storage/r2": {},
    "@/lib/public-page-url": urls,
  });
  await qr.GET({ url: "https://buzzinbeats.com/api/pages/10/qr-code?format=svg" }, { params: Promise.resolve({ id: 10 }) });
  assert.equal(qrDestination, "https://buzzinbeats.com/Old%20Name/menu");
});

test("new addresses resolve independently, even when another account takes the old name", async () => {
  const tables = fixture();
  tables.users.push({ id: 2, name: "Old Name", bypass_subscription: true });
  tables.pages.push({ ...tables.pages[0], id: 11, public_username: "New Name", slug: "new-menu" });
  const load = publicLoader(tables);
  assert.equal((await load("Old Name", "menu")).owner.id, 1);
  assert.equal((await load("New Name", "new-menu")).page.id, 11);
  assert.equal((await load("New Name", "menu")).kind, "not_found");
});

test("saved addresses still enforce publication, deletion, status and subscription gates", async () => {
  for (const [patch, expected] of [
    [{ is_published: false }, "not_found"],
    [{ deleted_at: "2026-01-01" }, "not_found"],
    [{ status: "inactive" }, "inactive"],
  ]) {
    const tables = fixture();
    Object.assign(tables.pages[0], patch);
    assert.equal((await publicLoader(tables)("Old Name", "menu")).kind, expected);
  }
  const tables = fixture();
  tables.users[0].bypass_subscription = false;
  assert.equal((await publicLoader(tables)("Old Name", "menu")).kind, "subscription_required");
});

test("address segments round-trip spaces, Unicode, percent signs, slashes and punctuation", () => {
  const page = { public_username: "Café 100% / A&B?#", slug: "summer-menu" };
  const url = new URL(urls.publicPageUrl(page, "https://buzzinbeats.com/"));
  const segments = url.pathname.split("/").slice(1).map(decodeURIComponent);
  assert.equal(segments.length, 2);
  assert.equal(segments[0], page.public_username);
  assert.equal(segments[1], page.slug);
  assert.equal(url.hash, "");
  assert.equal(url.search, "");
});

test("page edits reject address changes but still allow title changes", async () => {
  const tables = fixture();
  const db = database(tables);
  const api = loadModule("src/app/api/pages/[id]/route.ts", {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    "@/lib/data/current-user": { getCurrentUser: async () => tables.users[0] },
    "@/lib/supabase/server": { createClient: async () => db },
  });
  const params = { params: Promise.resolve({ id: 10 }) };
  const request = (slug) => ({ formData: async () => new Map([["title", "Updated menu"], ["slug", slug]]) });
  assert.equal((await api.PUT(request("changed-menu"), params)).status, 422);
  assert.equal(db.updates.length, 0);
  assert.equal((await api.PUT(request("menu"), params)).status, 200);
  assert.equal(db.updates[0].values.title, "Updated menu");
  assert.equal(Object.hasOwn(db.updates[0].values, "slug"), false);
  assert.equal(Object.hasOwn(db.updates[0].values, "public_username"), false);
});

test("another account cannot edit an existing page address or content", async () => {
  const tables = fixture();
  const db = database(tables);
  const api = loadModule("src/app/api/pages/[id]/route.ts", {
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    "@/lib/data/current-user": { getCurrentUser: async () => ({ id: 2 }) },
    "@/lib/supabase/server": { createClient: async () => db },
  });
  const request = { formData: async () => new Map([["title", "Changed"], ["slug", "menu"]]) };
  assert.equal((await api.PUT(request, { params: Promise.resolve({ id: 10 }) })).status, 404);
  assert.equal(db.updates.length, 0);
});
