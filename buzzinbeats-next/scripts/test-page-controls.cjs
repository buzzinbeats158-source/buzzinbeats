// Run: node --test scripts/test-page-controls.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

function loadModule(file, dependencies) {
  const filename = path.join(__dirname, "..", file);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, Date, URL, Promise,
    require(name) {
      if (Object.hasOwn(dependencies, name)) return dependencies[name];
      if (name === "react" || name === "react/jsx-runtime") return require(name);
      throw new Error(`Unexpected dependency: ${name}`);
    },
  }, { filename });
  return exports;
}

function fixture(user = { id: 1 }) {
  const row = { id: 86, user_id: 1, title: "Rank Pulse", public_username: "growpro", slug: "rank-pulse", is_published: false, deleted_at: null };
  const invalidated = [];
  const db = {
    row,
    async rpc() { return { data: { ...row, is_published: true } }; },
    from() {
      let changes;
      const filters = [];
      const query = {
        update(values) { changes = values; return query; },
        eq(key, value) { filters.push((r) => String(r[key]) === String(value)); return query; },
        is(key, value) { filters.push((r) => r[key] === value); return query; },
        select() { return query; },
        async maybeSingle() {
          if (!filters.every((f) => f(row))) return { data: null };
          if (changes) Object.assign(row, changes);
          return { data: { ...row } };
        },
      };
      return query;
    },
  };
  const dependencies = {
    "next/cache": { revalidatePath: (p) => invalidated.push(p) },
    "next/server": { NextResponse: { json: (body, options) => ({ body, status: options?.status ?? 200 }) } },
    "@/lib/data/current-user": { getCurrentUser: async () => user },
    "@/lib/supabase/server": { createClient: async () => db },
  };
  return { row, db, dependencies, invalidated };
}

test("Publish Page creation returns success only when the page is published", async () => {
  const f = fixture();
  const api = loadModule("src/app/api/pages/route.ts", f.dependencies);
  const request = { formData: async () => new Map([["title", "Rank Pulse"], ["description", "Exam prep"]]) };
  let result = await api.POST(request);
  assert.equal(result.status, 200);
  assert.equal(result.body.is_published, true);
  f.db.rpc = async () => ({ data: { ...f.row, is_published: false } });
  result = await api.POST(request);
  assert.equal(result.status, 500);
  assert.equal(result.body.success, false);
  assert.match(result.body.message, /could not be published/);
});

test("creation retries a slug collision and still verifies publication", async () => {
  const f = fixture();
  const calls = [];
  f.db.rpc = async (_, args) => {
    calls.push(args);
    return calls.length === 1 ? { error: { code: "23505" } } : { data: { ...f.row, slug: args.p_slug, is_published: true } };
  };
  const api = loadModule("src/app/api/pages/route.ts", f.dependencies);
  const result = await api.POST({ formData: async () => new Map([["title", "Rank Pulse"]]) });
  assert.equal(result.status, 200);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].p_slug, "rank-pulse");
  assert.match(calls[1].p_slug, /^rank-pulse-.+/);
  assert.equal(calls[1].p_user_id, 1);
});

test("the alternate creation action also rejects an unpublished result", async () => {
  const f = fixture();
  const actions = loadModule("src/lib/data/pages.ts", f.dependencies);
  const form = new Map([["title", "Rank Pulse"]]);
  assert.equal((await actions.createPageAction(form)).is_published, true);
  f.db.rpc = async () => ({ data: { ...f.row, is_published: false } });
  await assert.rejects(actions.createPageAction(form), /could not be published/);
});

test("publish, draft and republish preserve the URL and refresh the list and editor", async () => {
  const f = fixture();
  const actions = loadModule("src/lib/data/pages.ts", f.dependencies);
  for (const published of [true, false, true]) {
    await actions.togglePublishAction(86, published);
    assert.equal(f.row.is_published, published);
    assert.equal(f.row.public_username, "growpro");
    assert.equal(f.row.slug, "rank-pulse");
  }
  assert.ok(f.invalidated.includes("/dashboard/pages"));
  assert.ok(f.invalidated.includes("/dashboard/pages/86"));
});

test("publication rejects guests, another owner's page and deleted pages", async () => {
  for (const user of [null, { id: 2 }]) {
    const f = fixture(user);
    const actions = loadModule("src/lib/data/pages.ts", f.dependencies);
    await assert.rejects(actions.togglePublishAction(86, true), /Not authenticated|Page not found/);
    assert.equal(f.row.is_published, false);
  }
  const f = fixture();
  f.row.deleted_at = "2026-10-27";
  const actions = loadModule("src/lib/data/pages.ts", f.dependencies);
  await assert.rejects(actions.togglePublishAction(86, true), /Page not found/);
});

test("Delete removes only the owner's page and hides it without changing its saved URL", async () => {
  const f = fixture();
  f.row.is_published = true;
  const api = loadModule("src/app/api/pages/[id]/route.ts", f.dependencies);
  const params = { params: Promise.resolve({ id: "86" }) };
  assert.equal((await api.DELETE({}, params)).status, 200);
  assert.ok(f.row.deleted_at);
  assert.equal(f.row.is_published, false);
  assert.equal(f.row.public_username, "growpro");
  assert.equal(f.row.slug, "rank-pulse");
  assert.ok(f.invalidated.includes("/dashboard/pages"));
  assert.equal((await api.DELETE({}, params)).status, 404);
});

test("Delete rejects guests and other owners without removing the page", async () => {
  for (const [user, status] of [[null, 401], [{ id: 2 }, 404]]) {
    const f = fixture(user);
    const api = loadModule("src/app/api/pages/[id]/route.ts", f.dependencies);
    assert.equal((await api.DELETE({}, { params: Promise.resolve({ id: "86" }) })).status, status);
    assert.equal(f.row.deleted_at, null);
  }
});

test("publication controls show the current state and offer the opposite action", () => {
  const Button = loadModule("src/components/PagePublicationButton.tsx", {
    "next/navigation": { useRouter: () => ({ refresh() {} }) },
    "@/lib/data/pages": { togglePublishAction() {} },
  }).default;
  const published = renderToStaticMarkup(React.createElement(Button, { pageId: 86, isPublished: true }));
  const draft = renderToStaticMarkup(React.createElement(Button, { pageId: 86, isPublished: false }));
  assert.match(published, /aria-checked="true"/);
  assert.match(published, /Move to Draft/);
  assert.match(draft, /aria-checked="false"/);
  assert.match(draft, /Publish Page/);
});

test("publication is available in both views, while deletion is restricted to the editor", () => {
  const navigation = { useRouter: () => ({ refresh() {}, push() {} }) };
  const publication = loadModule("src/components/PagePublicationButton.tsx", {
    "next/navigation": navigation,
    "@/lib/data/pages": { togglePublishAction() {} },
  });
  const deletion = loadModule("src/components/DeletePageButton.tsx", { "next/navigation": navigation });
  const urls = loadModule("src/lib/public-page-url.ts", {});
  const dependencies = {
    "next/link": { default: ({ children, ...props }) => React.createElement("a", props, children) },
    "@/lib/public-page-url": urls,
    "@/components/PagePublicationButton": publication,
    "@/components/DeletePageButton": deletion,
  };
  const Header = loadModule("src/components/PageHeaderCard.tsx", dependencies).default;
  const Table = loadModule("src/components/PagesTable.tsx", dependencies).default;
  for (const isPublished of [true, false]) {
    const page = { ...fixture().row, page_id: "P086", serial_number: 86, is_published: isPublished, status: "active", description: "Exam prep", qrVersion: "1", productsCount: 0, redirectLinksCount: 0, digitalProductsCount: 0 };
    const header = renderToStaticMarkup(React.createElement(Header, { page, publicUrl: urls.publicPageUrl(page, "https://buzzinbeats.com") }));
    const table = renderToStaticMarkup(React.createElement(Table, { pages: [page], planLimit: 10, initialActiveCount: 1 }));
    for (const markup of [header, table]) {
      assert.match(markup, isPublished ? /Move to Draft/ : /Publish Page/);
    }
    assert.match(header, /Delete Page/);
    assert.doesNotMatch(table, /Delete Page/);
    assert.equal(table.includes('href="/growpro/rank-pulse"'), isPublished);
  }
});
