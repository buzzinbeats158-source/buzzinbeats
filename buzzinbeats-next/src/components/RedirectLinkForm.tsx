"use client";

import { useState } from "react";
import { publicStorageUrl } from "@/lib/storage";
import ImageCropField from "@/components/ImageCropField";
import RichTextEditor from "@/components/RichTextEditor";

type RedirectLink = {
  id: number;
  title: string;
  description: string | null;
  destination_url: string;
  button_text: string;
  open_in_new_tab: boolean;
  image_path: string | null;
};

export default function RedirectLinkForm({
  pageId,
  editing,
  onCancelEdit,
  createAction,
  updateAction,
}: {
  pageId: number;
  editing: RedirectLink | null;
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
      <p className="mb-1 text-xs text-slate-500">Send visitors to another website or landing page.</p>
      <input name="title" defaultValue={editing?.title ?? ""} placeholder="Title" required className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      <input
        name="destination_url"
        defaultValue={editing?.destination_url ?? ""}
        placeholder="Destination URL"
        required
        type="url"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <RichTextEditor name="description" defaultValue={editing?.description ?? ""} placeholder="Description" />
      <input
        name="button_text"
        defaultValue={editing?.button_text ?? ""}
        placeholder="Button text (default: Visit)"
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <input type="checkbox" name="open_in_new_tab" defaultChecked={editing?.open_in_new_tab ?? true} /> Open in new tab
      </label>

      <ImageCropField
        name="image"
        label="Image"
        aspectRatio={1280 / 800}
        existingImageUrl={editing?.image_path ? publicStorageUrl(editing.image_path) : null}
      />

      <div className="mt-1 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Saving..." : editing ? "Save Changes" : "Add redirect link"}
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
