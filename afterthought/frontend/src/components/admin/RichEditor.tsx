"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading1, Heading2, Quote, List, ListOrdered, Code } from 'lucide-react';
import { useEffect } from 'react';

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your essay...',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-zinc max-w-none font-sans leading-loose focus:outline-none min-h-[500px]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Keep content in sync if value is loaded externally
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/30 overflow-hidden">
      <div className="flex flex-wrap gap-2 p-3 border-b border-zinc-800 bg-zinc-900/80">
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Quote"
        >
          <Quote size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('codeBlock') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          title="Code Block"
        >
          <Code size={16} />
        </button>
      </div>
      <div className="p-6">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
