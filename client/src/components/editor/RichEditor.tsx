"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { Callout } from "../../lib/tiptap/callout-extension";
import { mediaApi } from "../../lib/media-api";
import { forwardRef, useImperativeHandle } from "react";

export interface RichEditorHandle {
  setContent: (json: any) => void;
}

export const RichEditor = forwardRef<
  RichEditorHandle,
  { content: any; onChange: (json: any) => void }
>(function RichEditor({ content, onChange }, ref) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false }),
      Image,
      Link.configure({ openOnClick: false }),
      Youtube.configure({ width: 480, height: 270 }),
      TextStyle,
      Color,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: "Write the campaign story…" }),
      Callout,
    ],
    content: content || { type: "doc", content: [{ type: "paragraph" }] },
    onUpdate: ({ editor }) => onChange(editor.getJSON()),
    immediatelyRender: false, // avoids Next.js SSR hydration mismatch — TipTap's docs flag this explicitly for App Router
  });

  useImperativeHandle(ref, () => ({
    setContent: (json: any) => {
      editor?.commands.setContent(json);
    },
  }));

  const handleImageUpload = async (file: File) => {
    if (!editor) return;
    const { data } = await mediaApi.upload(file, "CAMPAIGN");
    editor
      .chain()
      .focus()
      .setImage({ src: (data as any).url })
      .run();
  };

  if (!editor) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <EditorToolbar
        editor={editor}
        onImageClick={() => fileInputRef.current?.click()}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          e.target.files?.[0] && handleImageUpload(e.target.files[0])
        }
      />
      <EditorContent editor={editor} />
    </div>
  );
});
