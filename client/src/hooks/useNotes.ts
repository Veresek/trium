import { useCallback, useEffect, useState } from "react";

import { notesApi } from "../api/resources";
import type { Note, NoteCreate, NoteUpdate } from "../types";

function noteOrder(left: Note, right: Note) {
  return (
    right.updatedAt.localeCompare(left.updatedAt) ||
    left.id.localeCompare(right.id)
  );
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setNotes((await notesApi.list()).sort(noteOrder));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Notes could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createNote = async (payload: NoteCreate) => {
    setError(null);
    try {
      const created = await notesApi.create(payload);
      setNotes((current) => [...current, created].sort(noteOrder));
      return created;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The note could not be created.",
      );
      throw caught;
    }
  };

  const updateNote = async (id: string, payload: NoteUpdate) => {
    setError(null);
    try {
      const updated = await notesApi.update(id, payload);
      setNotes((current) =>
        current
          .map((note) => (note.id === id ? updated : note))
          .sort(noteOrder),
      );
      return updated;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The note could not be updated.",
      );
      throw caught;
    }
  };

  const deleteNote = async (id: string) => {
    setError(null);
    try {
      await notesApi.remove(id);
      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The note could not be deleted.",
      );
      throw caught;
    }
  };

  return {
    notes,
    loading,
    error,
    retry: load,
    createNote,
    updateNote,
    deleteNote,
  };
}
