"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { publicPageUrl } from "@/lib/public-page-url";

type PageRecord = {
  id: number;
  title: string;
  description: string | null;
  slug: string;
  public_username: string;
  qr_color: string | null;
  qr_logo_path: string | null;
};

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CreatePageScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [page, setPage] = useState<PageRecord | null>(null);
  const [loaded, setLoaded] = useState(!editId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(!!editId);
  const [qrColor, setQrColor] = useState("#000000");
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [origin, setOrigin] = useState("");
  const [username, setUsername] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const previewTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isEditMode = !!page;
  const urlUsername = page?.public_username ?? username;

  useEffect(() => {
    setOrigin(window.location.origin);
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUsername(d.name ?? ""));
  }, []);

  useEffect(() => {
    if (!editId) return;
    fetch(`/api/pages/${editId}/details`)
      .then((r) => r.json())
      .then((d: PageRecord) => {
        setPage(d);
        setTitle(d.title);
        setDescription(d.description ?? "");
        setSlug(d.slug);
        setQrColor(d.qr_color ?? "#000000");
        setLoaded(true);
      });
  }, [editId]);

  const previewUrl = publicPageUrl({ public_username: urlUsername, slug: slug || "..." }, origin).replace(/^https?:\/\//, "");

  useEffect(() => {
    if (!slugTouched && title) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  useEffect(() => {
    if (!isEditMode && !title) return;
    if (previewTimeout.current) clearTimeout(previewTimeout.current);
    previewTimeout.current = setTimeout(() => {
      const fullUrl = publicPageUrl({ public_username: urlUsername, slug: slug || "..." }, origin);
      fetch("/api/pages/qr-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: fullUrl, color: qrColor }),
      })
        .then((r) => r.json())
        .then((d) => setQrSvg(d.svg))
        .catch(() => {});
    }, 300);
  }, [slug, qrColor, origin, urlUsername, isEditMode, title]);

  async function handlePublish() {
    if (!title) {
      setAlert({ type: "error", message: "Please enter a page name." });
      return;
    }
    setSaving(true);
    setAlert(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("description", description);
    formData.set("slug", slug);

    const url = isEditMode ? `/api/pages/${page!.id}` : "/api/pages";
    const method = isEditMode ? "PUT" : "POST";

    try {
      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Something went wrong");

      if (!isEditMode) {
        router.push(data.redirect_url);
        return;
      }
      setAlert({ type: "success", message: "Page updated successfully!" });
    } catch (e) {
      setAlert({ type: "error", message: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    if (!page) return;
    const formData = new FormData();
    formData.set("qr_color", qrColor);
    formData.set("qr_logo", file);
    await fetch(`/api/pages/${page.id}/qr-settings`, { method: "POST", body: formData });
  }

  async function handleColorChange(color: string) {
    setQrColor(color);
    if (!page) return;
    const formData = new FormData();
    formData.set("qr_color", color);
    await fetch(`/api/pages/${page.id}/qr-settings`, { method: "POST", body: formData });
  }

  async function handleDelete() {
    if (!page) return;
    await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
    router.push("/dashboard/pages");
  }

  if (!loaded) return <div className="mx-auto max-w-4xl py-12 text-center text-slate-400">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEditMode ? "Edit Page Identity" : "Create New Page"}</h1>
          <p className="text-slate-500">
            {isEditMode ? "Update your page details and settings." : "Step 1: Set up your new landing page identity."}
          </p>
        </div>
      </div>

      {alert && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-xl border p-4 ${
            alert.type === "success" ? "border-green-100 bg-green-50 text-green-600" : "border-red-100 bg-red-50 text-red-600"
          }`}
        >
          <span className="material-symbols-outlined">{alert.type === "success" ? "check_circle" : "error"}</span>
          {alert.message}
        </div>
      )}

      {/* Page Identity */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">fingerprint</span>
          <div>
            <h2 className="text-lg font-semibold">Page Identity</h2>
            <p className="text-xs text-slate-500">Define your public profile presence</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Page Name</label>
              <span className="text-[10px] text-slate-400">{title.length}/50</span>
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 50))}
              placeholder="e.g. Summer Tour 2024"
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <span className="text-[10px] text-slate-400">{description.length}/150</span>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 150))}
              placeholder="Tell your audience what this page is about..."
              className="h-[42px] min-h-[42px] w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-end gap-4">
        <button
          onClick={handlePublish}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-70"
        >
          <span>{saving ? "Processing..." : isEditMode ? "Save Changes" : "Publish Page"}</span>
          <span className="material-symbols-outlined text-sm">{isEditMode ? "save" : "rocket_launch"}</span>
        </button>
      </div>

      {/* QR & Link Settings */}
      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined rounded-lg bg-primary/10 p-2 text-primary">qr_code_2</span>
          <div>
            <h2 className="text-lg font-semibold">QR & Link Settings</h2>
            <p className="text-xs text-slate-500">Customize how people find your content</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Custom URL Slug</label>
              <div className="flex items-center">
                <span className="rounded-l-lg border border-r-0 border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-500">
                  {origin.replace(/^https?:\/\//, "")}/{urlUsername}/
                </span>
                <input
                  value={slug}
                  readOnly={!!editId}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="your-custom-url"
                  className="flex-1 rounded-r-lg border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                />
              </div>
              <p className="text-xs text-slate-400">
                {editId
                  ? "This address is permanently locked to protect shared links and QR codes."
                  : "Choose your address carefully. It is permanently locked when you create the page, even if you later change your name."}
              </p>
            </div>

            <div className={`grid grid-cols-2 gap-4 ${isEditMode ? "" : "pointer-events-none opacity-50"}`}>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">QR Accent Color</label>
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-slate-200"
                  />
                  <span className="font-mono text-sm uppercase text-slate-600">{qrColor}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Center Logo</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-2 transition-colors hover:border-primary">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  <span className="text-sm">Upload PNG</span>
                  <input
                    type="file"
                    accept="image/png"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  />
                </label>
              </div>
            </div>
            {!isEditMode && (
              <p className="text-xs font-medium text-orange-500">* Visual customization available after creating the page.</p>
            )}
          </div>

          {/* Live Preview */}
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-slate-50 p-6">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Link Preview</p>
            {qrSvg ? (
              <div
                className="mb-3 flex h-[136px] w-[136px] items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white p-2 shadow-md"
                dangerouslySetInnerHTML={{ __html: qrSvg.replace("<svg", '<svg width="120" height="120"') }}
              />
            ) : (
              <div className="mb-3 flex h-[136px] w-[136px] items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-white p-2 shadow-md">
                <span className="material-symbols-outlined text-6xl text-slate-300">qr_code_2</span>
              </div>
            )}
            <div className="mb-6 flex w-full items-center gap-2 overflow-hidden rounded-lg border border-slate-200 bg-white/50 p-1.5">
              <span className="flex-1 truncate px-1 text-[10px] font-medium text-primary">{previewUrl}</span>
            </div>
            <a
              href={isEditMode ? `/api/pages/${page!.id}/qr-code` : "#"}
              className={`flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-sm transition-all ${
                isEditMode ? "" : "pointer-events-none opacity-50"
              }`}
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Download QR
            </a>
          </div>
        </div>
      </section>

      <div className="mt-8 flex items-center justify-end gap-4">
        {isEditMode && (
          <button
            onClick={() => setShowDeleteModal(true)}
            className="mr-auto flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-slate-400 transition-all hover:bg-red-50 hover:text-red-500"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Delete Page
          </button>
        )}
        <a
          href={isEditMode ? `/dashboard/pages/${page!.id}` : "#"}
          className={`flex items-center gap-2 rounded-lg px-6 py-2 font-semibold transition-all ${
            isEditMode ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90" : "pointer-events-none bg-slate-200 text-slate-400"
          }`}
        >
          <span>{isEditMode ? "Manage Content" : "Next Step"}</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </a>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-2xl">
            <div className="px-6 pb-6 pt-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <span className="material-symbols-outlined text-red-600">warning</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Delete Page?</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">
                    Are you sure you want to delete <span className="font-bold text-slate-700">&quot;{page?.title}&quot;</span>? This
                    action is permanent and cannot be undone. All associated products and links will be removed.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50"
              >
                Keep Page
              </button>
              <button
                onClick={handleDelete}
                className="inline-flex justify-center rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
