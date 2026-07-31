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
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your essay...',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'ProseMirror prose prose-invert max-w-none font-sans leading-loose focus:outline-none min-h-[500px]',
        role: 'textbox',
        'aria-label': 'Essay content',
        'aria-multiline': 'true',
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
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('bold') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Bold"
          aria-pressed={editor.isActive('bold')}
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('italic') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Italic"
          aria-pressed={editor.isActive('italic')}
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 1 }).run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Heading 1"
          aria-pressed={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleHeading({ level: 2 }).run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Heading 2"
          aria-pressed={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBlockquote().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('blockquote') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Block quote"
          aria-pressed={editor.isActive('blockquote')}
        >
          <Quote size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Bullet list"
          aria-pressed={editor.isActive('bulletList')}
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleOrderedList().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Numbered list"
          aria-pressed={editor.isActive('orderedList')}
        >
          <ListOrdered size={16} />
        </button>
        <div className="w-px h-6 bg-zinc-800 my-auto mx-1" />
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); editor.chain().focus().toggleCodeBlock().run() }}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${editor.isActive('codeBlock') ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
          aria-label="Code block"
          aria-pressed={editor.isActive('codeBlock')}
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
