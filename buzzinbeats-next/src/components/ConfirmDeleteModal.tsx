"use client";

/** Generic delete-confirmation modal, styled after the one in dashboard/pages/create. */
export default function ConfirmDeleteModal({
  title,
  itemName,
  pending,
  onConfirm,
  onCancel,
}: {
  title: string;
  itemName: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-2xl">
        <div className="px-6 pb-6 pt-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
              <span className="material-symbols-outlined text-red-600">warning</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-700">&quot;{itemName}&quot;</span>? This action is
                permanent and cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col-reverse gap-3 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex justify-center rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
