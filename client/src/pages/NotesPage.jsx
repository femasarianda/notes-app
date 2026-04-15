import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Trash2, Plus, Search, RotateCcw, Trash } from 'lucide-react';
import { getNotes, createNote, deleteNote, pinNote, restoreNote, permanentDelete } from '../api/notes';
import { useAuth } from '../context/AuthContext';
import NoteEditor from '../components/NoteEditor';
import TagManager from '../components/TagManager';
import DarkModeToggle from '../components/DarkModeToggle';

export default function NotesPage() {
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notes', search, showTrash, selectedTagId],
    queryFn: () => getNotes({ search, trash: showTrash, tag: selectedTagId }),
  });

  const notes = data?.data?.notes || [];

  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const pinMutation = useMutation({
    mutationFn: pinNote,
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const restoreMutation = useMutation({
    mutationFn: restoreNote,
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const permDeleteMutation = useMutation({
    mutationFn: permanentDelete,
    onSuccess: () => queryClient.invalidateQueries(['notes']),
  });

  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (res) => {
      queryClient.invalidateQueries(['notes']);
      setSelectedNote(res.data.note);
      setIsCreating(false);
    },
  });

  const handleNewNote = () => {
    createMutation.mutate({ title: 'Untitled', body: '' });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-foreground">📝 Notes</h1>
            <div className="flex gap-2">
              <DarkModeToggle />
              <button
                onClick={() => { setShowTrash(!showTrash); setSelectedNote(null); }}
                className={`p-1.5 rounded-md transition ${showTrash ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                title="Trash"
              >
                <Trash size={16} />
              </button>
              <button
                onClick={logout}
                className="text-xs text-muted-foreground hover:text-foreground transition"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search notes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* New Note Button */}
        {!showTrash && (
          <div className="p-3 border-b border-border">
            <button
              onClick={handleNewNote}
              disabled={createMutation.isPending}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              <Plus size={16} />
              New Note
            </button>
          </div>
        )}

        {/* Tag Manager */}
        {!showTrash && (
          <div className="border-b border-border pb-2 pt-1">
            <TagManager
              onSelectTag={setSelectedTagId}
              selectedTagId={selectedTagId}
            />
          </div>
        )}

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-12">
              {showTrash ? 'Trash is empty' : 'No notes yet'}
            </div>
          ) : (
            <AnimatePresence>
              {notes.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => setSelectedNote(note)}
                  className={`group relative p-3 rounded-md cursor-pointer transition ${
                    selectedNote?.id === note.id
                      ? 'bg-accent'
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        {note.isPinned && <Pin size={10} className="text-primary flex-shrink-0" />}
                        <p className="text-sm font-medium text-foreground truncate">
                          {note.title || 'Untitled'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {note.body?.replace(/<[^>]+>/g, '') || 'No content'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      {!showTrash ? (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); pinMutation.mutate(note.id); }}
                            className="p-1 rounded hover:bg-background transition"
                            title={note.isPinned ? 'Unpin' : 'Pin'}
                          >
                            <Pin size={12} className={note.isPinned ? 'text-primary' : 'text-muted-foreground'} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteMutation.mutate(note.id); }}
                            className="p-1 rounded hover:bg-background transition"
                            title="Move to trash"
                          >
                            <Trash2 size={12} className="text-muted-foreground hover:text-destructive" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={e => { e.stopPropagation(); restoreMutation.mutate(note.id); }}
                            className="p-1 rounded hover:bg-background transition"
                            title="Restore"
                          >
                            <RotateCcw size={12} className="text-muted-foreground" />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); permDeleteMutation.mutate(note.id); }}
                            className="p-1 rounded hover:bg-background transition"
                            title="Delete permanently"
                          >
                            <Trash2 size={12} className="text-destructive" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* User info */}
        <div className="p-3 border-t border-border">
          <p className="text-xs text-muted-foreground truncate">👤 {user?.name}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onUpdate={() => queryClient.invalidateQueries(['notes'])}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-4xl mb-4">📝</p>
            <p className="text-sm">Select a note or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
}