"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const POLL_MS = 300;

/**
 * Polls a mounted <form> (found inside `containerRef`) on an interval and
 * runs `build` over its current FormData. Polling (rather than wiring an
 * input/change listener) is what lets this stay decoupled from every field
 * component's own update mechanism — some are plain inputs, some (the rich
 * text editor, the image cropper) push their value into the form
 * imperatively without firing a native event.
 */
export function useLiveFormDraft<T>(containerRef: React.RefObject<HTMLElement | null>, build: (fd: FormData) => T | null): T | null {
  const [draft, setDraft] = useState<T | null>(null);
  const buildRef = useRef(build);

  useEffect(() => {
    buildRef.current = build;
  });

  useEffect(() => {
    function tick() {
      const form = containerRef.current?.querySelector("form");
      setDraft(form ? buildRef.current(new FormData(form as HTMLFormElement)) : null);
    }
    const id = window.setInterval(tick, POLL_MS);
    tick();
    return () => window.clearInterval(id);
  }, [containerRef]);

  return draft;
}

/** Turns a File pulled from a draft's FormData into a stable, revoked-on-change object URL. */
export function useDraftObjectUrl(file: File | null | undefined): string | null {
  const url = useMemo(() => {
    if (!file || file.size === 0) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  return url;
}
