"use client";

import { Editor } from "@tiptap/react";

import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Link as LinkIcon,
  ImageIcon,
  Video,
  Table as TableIcon,
  AlertCircle,
  Palette,
} from "lucide-react";

function ToolButton({ active, onClick, children, title }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-md p-1.5 transition-colors ${
        active
          ? "bg-accent/10 text-accent"
          : "text-text-secondary hover:bg-bg hover:text-text-primary"
      }`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  onImageClick,
}: {
  editor: Editor;
  onImageClick: () => void;
}) {
  if (!editor) return null;

  const addYoutube = () => {
    const url = prompt("YouTube URL");
    if (url) editor.commands.setYoutubeVideo({ src: url });
  };

  const addLink = () => {
    const url = prompt("Link URL");
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const setColor = () => {
    const color = prompt("Hex color (e.g. #DC2626)");
    if (color) editor.chain().focus().setColor(color).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-bg/50 p-1.5">
      <ToolButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </ToolButton>
      <ToolButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolButton>
      <ToolButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={15} />
      </ToolButton>
      <ToolButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </ToolButton>
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolButton>
      <ToolButton
        title="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolButton>
      <ToolButton
        title="Quote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolButton>
      <ToolButton
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={15} />
      </ToolButton>
      <ToolButton
        title="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={15} />
      </ToolButton>
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolButton
        title="Callout"
        active={editor.isActive("callout")}
        onClick={() => (editor.commands as any).setCallout("info")}
      >
        <AlertCircle size={15} />
      </ToolButton>
      <ToolButton title="Text color" onClick={setColor}>
        <Palette size={15} />
      </ToolButton>
      <div className="mx-1 h-4 w-px bg-border" />
      <ToolButton
        title="Link"
        active={editor.isActive("link")}
        onClick={addLink}
      >
        <LinkIcon size={15} />
      </ToolButton>
      <ToolButton title="Image" onClick={onImageClick}>
        <ImageIcon size={15} />
      </ToolButton>
      <ToolButton title="YouTube embed" onClick={addYoutube}>
        <Video size={15} />
      </ToolButton>
      <ToolButton
        title="Table"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        <TableIcon size={15} />
      </ToolButton>
    </div>
  );
}
