"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Extension } from "@tiptap/core";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import type { EmojiClickData } from "emoji-picker-react";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

/** Adds a `data-marker` attribute to list items so a single style, chosen per line from the
 * "List Style" dropdown, can be rendered consistently by the shared .rt-content/.rt-editor CSS
 * (see globals.css) on both the admin editor and the public landing-page card. */
const ListMarkerStyle = Extension.create({
  name: "listMarkerStyle",
  addGlobalAttributes() {
    return [
      {
        types: ["listItem"],
        attributes: {
          marker: {
            default: null,
            parseHTML: (element) => element.getAttribute("data-marker"),
            renderHTML: (attributes) => (attributes.marker ? { "data-marker": attributes.marker } : {}),
          },
        },
      },
    ];
  },
});

type MarkerValue =
  | null
  | "check"
  | "green-check"
  | "red-cross"
  | "arrow"
  | "star"
  | "circle-number"
  | "plain-numbered";

const LIST_STYLE_OPTIONS: { marker: MarkerValue; label: string; preview: string }[] = [
  { marker: null, label: "Default Bullet", preview: "•" },
  { marker: "check", label: "Check List", preview: "✓" },
  { marker: "green-check", label: "Green Check", preview: "✓" },
  { marker: "red-cross", label: "Red Cross", preview: "✕" },
  { marker: "arrow", label: "Arrow List", preview: "→" },
  { marker: "star", label: "Star List", preview: "★" },
  { marker: "circle-number", label: "Numbered Circle", preview: "①" },
  { marker: "plain-numbered", label: "Plain Numbered", preview: "1." },
];

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`flex h-7 min-w-7 items-center justify-center rounded px-1.5 text-sm font-bold transition-colors ${
        active ? "bg-primary/15 text-primary" : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

/** Applies (or clears) a marker style on the current list item, wrapping the current
 * block in a bullet list first if it isn't already part of a list. */
function applyListMarker(editor: Editor | null, marker: MarkerValue) {
  if (!editor) return;
  if (!editor.isActive("bulletList") && !editor.isActive("orderedList")) {
    editor.chain().focus().toggleBulletList().run();
  }
  editor.chain().focus().updateAttributes("listItem", { marker }).run();
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);
  return ref;
}

function ListStyleMenu({ editor, currentMarker }: { editor: Editor | null; currentMarker: MarkerValue }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  return (
    <div className="relative" ref={ref}>
      <ToolbarButton label="List style" active={open || !!currentMarker} onClick={() => setOpen((v) => !v)}>
        <span className="material-symbols-outlined text-base">checklist</span>
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {LIST_STYLE_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                applyListMarker(editor, option.marker);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                currentMarker === option.marker ? "bg-primary/10 text-primary" : "text-slate-700"
              }`}
            >
              <span className="w-4 text-center font-bold">{option.preview}</span>
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmojiMenu({ editor }: { editor: Editor | null }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));

  function insertEmoji(data: EmojiClickData) {
    editor?.chain().focus().insertContent(data.emoji).run();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <ToolbarButton label="Emoji" active={open} onClick={() => setOpen((v) => !v)}>
        <span className="material-symbols-outlined text-base">mood</span>
      </ToolbarButton>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1">
          <EmojiPicker onEmojiClick={insertEmoji} width={300} height={360} previewConfig={{ showPreview: false }} />
        </div>
      )}
    </div>
  );
}

export default function RichTextEditor({
  name,
  defaultValue,
  placeholder,
}: {
  name: string;
  defaultValue: string;
  placeholder?: string;
}) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        horizontalRule: false,
        strike: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto"],
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Description" }),
      ListMarkerStyle,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "rt-editor min-h-[4.5rem] px-3 py-2 text-sm text-slate-800 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML()),
  });

  useEffect(() => {
    return () => editor?.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyState = {
    bold: false,
    italic: false,
    bulletList: false,
    orderedList: false,
    link: false,
    marker: null as MarkerValue,
  };
  const state =
    useEditorState({
      editor,
      selector: ({ editor }) =>
        editor
          ? {
              bold: editor.isActive("bold"),
              italic: editor.isActive("italic"),
              bulletList: editor.isActive("bulletList"),
              orderedList: editor.isActive("orderedList"),
              link: editor.isActive("link"),
              marker: (editor.getAttributes("listItem").marker ?? null) as MarkerValue,
            }
          : emptyState,
    }) ?? emptyState;

  function setLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const href = /^(https?:|mailto:)/i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div className="rounded-lg border border-slate-300 focus-within:border-primary/60">
      <div className="flex items-center gap-0.5 rounded-t-lg border-b border-slate-200 bg-slate-50 px-1.5 py-1">
        <ToolbarButton label="Bold" active={state.bold} onClick={() => editor?.chain().focus().toggleBold().run()}>
          <span className="material-symbols-outlined text-base">format_bold</span>
        </ToolbarButton>
        <ToolbarButton label="Italic" active={state.italic} onClick={() => editor?.chain().focus().toggleItalic().run()}>
          <span className="material-symbols-outlined text-base">format_italic</span>
        </ToolbarButton>
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton
          label="Bulleted list"
          active={state.bulletList}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <span className="material-symbols-outlined text-base">format_list_bulleted</span>
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={state.orderedList}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <span className="material-symbols-outlined text-base">format_list_numbered</span>
        </ToolbarButton>
        <ListStyleMenu editor={editor} currentMarker={state.marker} />
        <EmojiMenu editor={editor} />
        <span className="mx-1 h-4 w-px bg-slate-200" />
        <ToolbarButton label="Link" active={state.link} onClick={setLink}>
          <span className="material-symbols-outlined text-base">link</span>
        </ToolbarButton>
        <ToolbarButton
          label="Clear formatting"
          onClick={() => editor?.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <span className="material-symbols-outlined text-base">format_clear</span>
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
