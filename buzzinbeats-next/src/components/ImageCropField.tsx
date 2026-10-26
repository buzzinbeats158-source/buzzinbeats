"use client";

import { useRef, useState } from "react";
import Cropper from "cropperjs";

const MAX_SELECT_BYTES = 10 * 1024 * 1024;
const OUTPUT_WIDTH = 1280;

export default function ImageCropField({
  name,
  label,
  aspectRatio,
  existingImageUrl,
  required,
  shape = "square",
  sizeClassName = "h-24 w-24",
  hoverIcon = "edit",
}: {
  name: string;
  label: string;
  aspectRatio: number;
  existingImageUrl?: string | null;
  required?: boolean;
  /** Visual shape of the preview/trigger button. Defaults to "square" (the
   * original behavior used by product/cover image fields). */
  shape?: "square" | "circle";
  /** Tailwind size classes for the preview/trigger button, e.g. "h-40 w-40". */
  sizeClassName?: string;
  /** Material Symbols icon name shown on hover. */
  hoverIcon?: string;
}) {
  const [preview, setPreview] = useState<string | null>(existingImageUrl ?? null);
  const [error, setError] = useState("");
  const [modalSrc, setModalSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickerInputRef = useRef<HTMLInputElement>(null);
  const cropImageRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);
  const scaleRef = useRef({ x: 1, y: 1 });

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SELECT_BYTES) {
      setError("File size exceeds 10MB. Please upload a smaller image.");
      return;
    }
    setError("");

    const reader = new FileReader();
    reader.onload = () => {
      setModalSrc(reader.result as string);
      requestAnimationFrame(() => {
        if (!cropImageRef.current) return;
        cropperRef.current?.destroy();
        scaleRef.current = { x: 1, y: 1 };
        cropperRef.current = new Cropper(cropImageRef.current, {
          aspectRatio,
          viewMode: 1,
          dragMode: "move",
          autoCropArea: 1,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
        });
      });
    };
    reader.readAsDataURL(file);
  }

  function closeModal() {
    cropperRef.current?.destroy();
    cropperRef.current = null;
    setModalSrc(null);
  }

  function saveCrop() {
    const cropper = cropperRef.current;
    if (!cropper) return;

    const outputHeight = Math.round(OUTPUT_WIDTH / aspectRatio);
    const canvas = cropper.getCroppedCanvas({
      width: OUTPUT_WIDTH,
      height: outputHeight,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: "high",
    });

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "cropped.jpg", { type: "image/jpeg", lastModified: Date.now() });

        if (fileInputRef.current) {
          const dt = new DataTransfer();
          dt.items.add(file);
          fileInputRef.current.files = dt.files;
        }

        setPreview(URL.createObjectURL(file));
        closeModal();
      },
      "image/jpeg",
      0.85,
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>

      <input ref={fileInputRef} type="file" name={name} accept="image/*" className="hidden" />
      <input ref={pickerInputRef} type="file" accept="image/*" className="hidden" onChange={handlePick} />

      <button
        type="button"
        onClick={() => pickerInputRef.current?.click()}
        className={`group relative flex items-center justify-center overflow-hidden border border-slate-200 bg-slate-50 transition-colors hover:border-primary/40 ${sizeClassName} ${
          shape === "circle" ? "rounded-full" : "rounded-lg"
        }`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-2xl text-slate-300">add_photo_alternate</span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-transparent transition-all group-hover:bg-black/40 group-hover:text-white">
          <span className="material-symbols-outlined text-xl">{hoverIcon}</span>
        </span>
      </button>
      {required && !preview && <input type="text" required className="sr-only" tabIndex={-1} />}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && <p className="mt-1 text-[10px] text-slate-400">Click to {preview ? "replace" : "upload"} — you can crop, rotate, and flip before saving.</p>}

      {modalSrc && (
        <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white text-left shadow-xl">
            <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <h3 className="text-lg font-medium text-slate-900">Crop Image</h3>
              <div className="mt-4 h-96 w-full overflow-hidden rounded-lg bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img ref={cropImageRef} src={modalSrc} alt="Picture to crop" className="max-w-full" />
              </div>
            </div>
            <div className="flex flex-col gap-3 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" title="Zoom In" onClick={() => cropperRef.current?.zoom(0.1)} className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined">zoom_in</span>
                </button>
                <button type="button" title="Zoom Out" onClick={() => cropperRef.current?.zoom(-0.1)} className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined">zoom_out</span>
                </button>
                <div className="mx-1 h-6 w-px bg-slate-200" />
                <button type="button" title="Rotate -90°" onClick={() => cropperRef.current?.rotate(-90)} className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined">rotate_left</span>
                </button>
                <button type="button" title="Rotate +90°" onClick={() => cropperRef.current?.rotate(90)} className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined">rotate_right</span>
                </button>
                <div className="mx-1 h-6 w-px bg-slate-200" />
                <button
                  type="button"
                  title="Flip Horizontal"
                  onClick={() => {
                    scaleRef.current.x *= -1;
                    cropperRef.current?.scale(scaleRef.current.x, scaleRef.current.y);
                  }}
                  className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined">flip</span>
                </button>
                <button
                  type="button"
                  title="Flip Vertical"
                  onClick={() => {
                    scaleRef.current.y *= -1;
                    cropperRef.current?.scale(scaleRef.current.x, scaleRef.current.y);
                  }}
                  className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200"
                >
                  <span className="material-symbols-outlined rotate-90">flip</span>
                </button>
                <div className="mx-1 h-6 w-px bg-slate-200" />
                <button type="button" title="Reset" onClick={() => cropperRef.current?.reset()} className="rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200">
                  <span className="material-symbols-outlined">restart_alt</span>
                </button>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                <button type="button" onClick={closeModal} className="text-sm font-medium text-slate-500 hover:text-slate-700">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveCrop}
                  className="rounded-lg border border-transparent bg-primary px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
