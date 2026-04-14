import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Check } from 'lucide-react';
import { getTags, createTag, updateTag, deleteTag } from '../api/tags';

const COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
];

export default function TagManager({ onSelectTag, selectedTagId }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const { data } = useQuery({
    queryKey: ['tags'],
    queryFn: getTags,
  });

  const tags = data?.data?.tags || [];

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      setNewTagName('');
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => queryClient.invalidateQueries(['tags']),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createMutation.mutate({ name: newTagName.trim(), color: newTagColor });
  };

  const handleEdit = (tag) => {
    setEditingId(tag.id);
    setEditName(tag.name);
  };

  const handleUpdate = (tag) => {
    updateMutation.mutate({ id: tag.id, data: { name: editName, color: tag.color } });
  };

  return (
    <div className="px-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Tags
        </span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-1 rounded hover:bg-accent transition text-muted-foreground"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Create Tag Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleCreate} className="p-2 space-y-2">
              <input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                autoFocus
                className="w-full px-2 py-1 text-xs rounded border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {/* Color Picker */}
              <div className="flex flex-wrap gap-1">
                {COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`w-5 h-5 rounded-full transition ring-offset-1 ${
                      newTagColor === color ? 'ring-2 ring-foreground' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-1">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-1 text-xs rounded bg-primary text-primary-foreground hover:opacity-90 transition disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-2 py-1 text-xs rounded border border-input hover:bg-accent transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tag List */}
      <div className="space-y-0.5">
        {/* All Notes */}
        <button
          onClick={() => onSelectTag(null)}
          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition ${
            !selectedTagId ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
          }`}
        >
          <span className="text-xs">All Notes</span>
        </button>

        {tags.map(tag => (
          <div
            key={tag.id}
            className={`group flex items-center gap-2 px-2 py-1.5 rounded-md transition cursor-pointer ${
              selectedTagId === tag.id ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
            onClick={() => onSelectTag(tag.id)}
          >
            {/* Color dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: tag.color }}
            />

            {editingId === tag.id ? (
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onClick={e => e.stopPropagation()}
                autoFocus
                className="flex-1 text-xs bg-transparent border-b border-input focus:outline-none text-foreground"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleUpdate(tag);
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
            ) : (
              <span className="flex-1 text-xs text-foreground truncate">{tag.name}</span>
            )}

            {/* Actions */}
            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition">
              {editingId === tag.id ? (
                <button
                  onClick={e => { e.stopPropagation(); handleUpdate(tag); }}
                  className="p-0.5 rounded hover:bg-background"
                >
                  <Check size={11} className="text-green-500" />
                </button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); handleEdit(tag); }}
                  className="p-0.5 rounded hover:bg-background"
                >
                  <Pencil size={11} className="text-muted-foreground" />
                </button>
              )}
              <button
                onClick={e => { e.stopPropagation(); deleteMutation.mutate(tag.id); }}
                className="p-0.5 rounded hover:bg-background"
              >
                <X size={11} className="text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}