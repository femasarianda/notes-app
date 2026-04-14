import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tag as TagIcon, X } from 'lucide-react';
import { getTags } from '../api/tags';
import { updateNote } from '../api/notes';

export default function TagSelector({ note, onUpdate }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const allTags = data?.data?.tags || [];
  const noteTags = note.Tags || [];
  const noteTagIds = noteTags.map(t => t.id);

  const mutation = useMutation({
    mutationFn: (tagIds) => updateNote(note.id, { tagIds }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      onUpdate();
    },
  });

  const toggleTag = (tagId) => {
    const newTagIds = noteTagIds.includes(tagId)
      ? noteTagIds.filter(id => id !== tagId)
      : [...noteTagIds, tagId];
    mutation.mutate(newTagIds);
  };

  return (
    <div className="relative">
      {/* Current Tags + Toggle Button */}
      <div className="flex items-center gap-1 flex-wrap">
        {noteTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button
              onClick={() => toggleTag(tag.id)}
              className="hover:opacity-70 transition"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-input text-muted-foreground hover:bg-accent transition"
        >
          <TagIcon size={10} />
          Add tag
        </button>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-7 left-0 z-10 w-48 rounded-md border border-border bg-background shadow-lg p-1">
          {allTags.length === 0 ? (
            <p className="text-xs text-muted-foreground p-2">No tags yet. Create one in the sidebar.</p>
          ) : (
            allTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-accent transition text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="text-xs text-foreground flex-1">{tag.name}</span>
                {noteTagIds.includes(tag.id) && (
                  <span className="text-xs text-primary">✓</span>
                )}
              </button>
            ))
          )}
          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="w-full text-xs text-muted-foreground hover:text-foreground px-2 py-1 text-left"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}