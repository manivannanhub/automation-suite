import { useState, useEffect } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('app-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notes', e);
      }
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('app-notes', JSON.stringify(newNotes));
  };

  const addNote = (title: string, content: string) => {
    const note: Note = {
      id: crypto.randomUUID(),
      title,
      content,
      updatedAt: new Date().toISOString(),
    };
    saveNotes([note, ...notes]);
    return note;
  };

  const updateNote = (id: string, updates: Partial<Pick<Note, 'title' | 'content'>>) => {
    const updated = notes.map((note) =>
      note.id === id
        ? { ...note, ...updates, updatedAt: new Date().toISOString() }
        : note
    );
    saveNotes(updated);
  };

  const deleteNote = (id: string) => {
    saveNotes(notes.filter((note) => note.id !== id));
  };

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
  };
}
