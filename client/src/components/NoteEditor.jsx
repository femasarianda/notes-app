import { useEffect, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { useMutation } from '@tanstack/react-query';
import { updateNote } from '../api/notes';
import { Bold, Italic, UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import TagSelcector from './TagSelector';

export default function NoteEditor({ note, onUpdate }) {
  const [title, setTitle] = useState(note.title || '');
  const [saved, setSaved] = useState(true);

  const mutation = useMutation({
    mutationFn: ({ title, body }) => updateNote(note.id, { title, body }),
    onSuccess: () => {
      setSaved(true);
      onUpdate();
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: note.body || '',
    onUpdate: ({ editor }) => {
      setSaved(false);
    },
  });

  // Autosave — 1 detik setelah berhenti ngetik
  const save = useCallback(() => {
    if (!editor) return;
    mutation.mutate({ title, body: editor.getHTML() });
  }, [editor, title, mutation]);

  useEffect(() => {
    if (saved) return;
    const timeout = setTimeout(save, 1000);
    return () => clearTimeout(timeout);
  }, [title, saved, save]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setSaved(false);
  };

  if (!editor) return null;

  const ToolbarButton = ({ onClick, active, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition ${
        active
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-border flex-wrap">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >
          <ListOrdered size={14} />
        </ToolbarButton>

        <div className="w-px h-4 bg-border mx-1" />

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align left"
        >
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align center"
        >
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align right"
        >
          <AlignRight size={14} />
        </ToolbarButton>

        {/* Save status */}
        <div className="ml-auto text-xs text-muted-foreground">
          {mutation.isPending ? 'Saving...' : saved ? '✓ Saved' : 'Unsaved'}
        </div>
      </div>

      {/* Title */}
      <div className="px-8 pt-8 pb-2">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-3xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
        />
      </div>

      {/* Tags */}
      <div className="px-8 pb-3">
        <TagSelector note={note} onUpdate={onUpdate} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <EditorContent
          editor={editor}
          className="prose prose-sm max-w-none text-foreground focus:outline-none min-h-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-64"
        />
      </div>
    </div>
  );
}