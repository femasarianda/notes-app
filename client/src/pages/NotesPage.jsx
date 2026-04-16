import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, Trash2, Plus, Search, RotateCcw, Trash, Menu, X, ChevronLeft } from 'lucide-react';
import { getNotes, createNote, deleteNote, pinNote, restoreNote, permanentDelete } from '../api/notes';
import { useAuth } from '../context/AuthContext';
import NoteEditor from '../components/NoteEditor';
import TagManager from '../components/TagManager';
import DarkModeToggle from '../components/DarkModeToggle';
import NoteCardSkeleton from '../components/NoteCardSkeleton';

// Reusable sidebar content
function SidebarContent({ showTrash, setShowTrash, search, setSearch, selectedNote, setSelectedNote, selectedTagId, setSelectedTagId, notes, isLoading, isError, handleNewNote, createMutation, pinMutation, deleteMutation, restoreMutation, permDeleteMutation, onSelectNote, onClose, user, logout, isMobile }) {
  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-foreground">📝 Notes</h1>
          <div className="flex gap-2 items-center">
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
            {/* Close button - mobile only */}
            {isMobile && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition"
              >
                <X size={16} />
              </button>
            )}
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
          <div className="space-y-1 p-2">
            {[...Array(6)].map((_, i) => (
              <NoteCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center text-destructive text-sm py-12 px-4">
            Failed to load notes. Check your connection.
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
                onClick={() => onSelectNote(note)}
                className={`group relative p-3 rounded-md cursor-pointer transition ${selectedNote?.id === note.id
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
    </>
  );
}

export default function NotesPage() {
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showTrash, setShowTrash] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
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
      setMobileSidebarOpen(false);
    },
  });

  const handleNewNote = () => {
    createMutation.mutate({ title: 'Untitled', body: '' });
  };

  const handleSelectNote = (note) => {
    setSelectedNote(note);
    setMobileSidebarOpen(false);
  };

  const sharedProps = {
    showTrash, setShowTrash,
    search, setSearch,
    selectedNote, setSelectedNote,
    selectedTagId, setSelectedTagId,
    notes, isLoading, isError,
    handleNewNote, createMutation,
    pinMutation, deleteMutation,
    restoreMutation, permDeleteMutation,
    user, logout,
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">

      {/* ── DESKTOP Sidebar (always visible on md+) ── */}
      <div className="hidden md:flex w-72 border-r border-border flex-col">
        <SidebarContent
          {...sharedProps}
          onSelectNote={setSelectedNote}
          onClose={() => {}}
          isMobile={false}
        />
      </div>

      {/* ── MOBILE Sidebar (drawer overlay) ── */}
      {/* Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-30 w-72 flex flex-col border-r border-border bg-background md:hidden"
          >
            <SidebarContent
              {...sharedProps}
              onSelectNote={handleSelectNote}
              onClose={() => setMobileSidebarOpen(false)}
              isMobile={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <div className="flex-1 overflow-hidden flex flex-col">

        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center gap-2 px-3 py-2 border-b border-border bg-background">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:bg-accent transition"
          >
            <Menu size={20} />
          </button>
          {selectedNote ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button
                onClick={() => setSelectedNote(null)}
                className="p-1 rounded text-muted-foreground hover:bg-accent transition"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-foreground truncate">
                {selectedNote.title || 'Untitled'}
              </span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-foreground">📝 Notes</span>
          )}
        </div>

        {/* Note Content Area */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {selectedNote ? (
              <motion.div
                key={selectedNote.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                <NoteEditor
                  note={selectedNote}
                  onUpdate={() => queryClient.invalidateQueries(['notes'])}
                />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-muted-foreground"
              >
                <p className="text-4xl mb-4">📝</p>
                <p className="text-sm">Select a note or create a new one</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}