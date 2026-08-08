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

export function StoryRenderer({ content }: { content: any }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Youtube,
      TextStyle,
      Color,
      Table,
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) return null;
  return <EditorContent editor={editor} className="prose-story" />;
}
