"use client";

import { useState } from "react";
import { publicStorageUrl } from "@/lib/storage";
import ImageCropField from "@/components/ImageCropField";
import RichTextEditor from "@/components/RichTextEditor";

type DigitalProduct = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  cover_image_path: string | null;
  original_file_name: string | null;
};

export default function DigitalProductForm({
  pageId,
  editing,
  onCancelEdit,
  createAction,
  updateAction,
}: {
  pageId: number;
  editing: DigitalProduct | null;
  onCancelEdit: () => void;
  createAction: (formData: FormData) => Promise<void>;
  updateAction: (formData: FormData) => Promise<void>;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [resetCount, setResetCount] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    const formData = new FormData(form);
    formData.set("page_id", String(pageId));
    try {
      if (editing) {
        formData.set("id", String(editing.id));
        await updateAction(formData);
        onCancelEdit();
      } else {
        await createAction(formData);
        form.reset();
        setResetCount((n) => n + 1);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      key={editing?.id ?? `new-${resetCount}`}
      onSubmit={handleSubmit}
      className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <input name="title" defaultValue={editing?.title ?? ""} placeholder="Title" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <RichTextEditor name="description" defaultValue={editing?.description ?? ""} placeholder="Description" />
      <input
        name="price"
        defaultValue={editing?.price ?? ""}
        placeholder="Price (0 for free)"
        type="number"
        step="0.01"
        min="0"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />

      <ImageCropField
        name="cover_image"
        label="Cover image (optional)"
        aspectRatio={1280 / 720}
        existingImageUrl={editing?.cover_image_path ? publicStorageUrl(editing.cover_image_path) : null}
      />

      <label className="text-xs font-bold text-slate-500">
        File to sell {editing ? "(optional)" : "(required)"}
        {editing?.original_file_name && <span className="font-normal text-slate-400"> — current: {editing.original_file_name}</span>}
      </label>
      <input name="file" type="file" required={!editing} className="text-sm" />
      {editing && <p className="text-[10px] text-slate-400">Leave empty to keep the current file.</p>}

      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : editing ? "Save Changes" : "Add digital product"}
        </button>
        {editing && (
          <button type="button" onClick={onCancelEdit} className="text-sm font-medium text-primary hover:text-primary/80">
            Cancel Edit
          </button>
        )}
      </div>
    </form>
  );
}
