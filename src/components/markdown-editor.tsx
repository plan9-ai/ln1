"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";
import { Markdown } from "tiptap-markdown";
import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  value?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
  uploadKey?: string;
}

async function uploadImage(
  file: File,
  key: string
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("key", key);

  const res = await fetch("/api/uploaded-files", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!res.ok) return null;

  const data = await res.json();
  return `/api/uploaded-files/${data.id}/download`;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  uploadKey,
}: MarkdownEditorProps) {
  const [sourceMode, setSourceMode] = useState(false);
  const sourceRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Image.configure({ inline: true }),
      Markdown,
    ],
    content: value ?? "",
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const md = (editor.storage as any).markdown.getMarkdown() as string;
      onChange?.(md);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[80px] px-3 py-2 focus:outline-none",
      },
      handlePaste: (view, event) => {
        if (!uploadKey) return false;

        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (!item.type.startsWith("image/")) continue;

          const file = item.getAsFile();
          if (!file) continue;

          event.preventDefault();
          uploadImage(file, uploadKey).then((url) => {
            if (url && view.state) {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const tr = view.state.tr.replaceSelectionWith(node);
              view.dispatch(tr);
            }
          });
          return true;
        }
        return false;
      },
      handleDrop: (view, event) => {
        if (!uploadKey) return false;

        const files = event.dataTransfer?.files;
        if (!files?.length) return false;

        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;

          event.preventDefault();
          const pos =
            view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            })?.pos ?? view.state.selection.from;

          uploadImage(file, uploadKey).then((url) => {
            if (url && view.state) {
              const { schema } = view.state;
              const node = schema.nodes.image.create({ src: url });
              const tr = view.state.tr.insert(pos, node);
              view.dispatch(tr);
            }
          });
          return true;
        }
        return false;
      },
    },
  });

  const getMarkdown = useCallback((): string => {
    if (!editor) return value ?? "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (editor.storage as any).markdown.getMarkdown() as string;
  }, [editor, value]);

  const toggleSource = useCallback(() => {
    if (sourceMode) {
      const md = sourceRef.current?.value ?? "";
      editor?.commands.setContent(md);
      onChange?.(md);
      setSourceMode(false);
    } else {
      setSourceMode(true);
    }
  }, [sourceMode, editor, onChange]);

  const handleSourceChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={toggleSource}
          className="rounded px-2 py-0.5 text-muted-foreground text-xs hover:bg-muted"
        >
          {sourceMode ? "Preview" : "Source"}
        </button>
      </div>
      {sourceMode ? (
        <Textarea
          ref={sourceRef}
          defaultValue={getMarkdown()}
          onChange={handleSourceChange}
          placeholder={placeholder}
          rows={6}
          className="font-mono text-sm"
        />
      ) : (
        <div className="rounded-md border border-input bg-transparent shadow-xs has-focus-visible:border-ring has-focus-visible:ring-ring/50 has-focus-visible:ring-[3px]">
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
