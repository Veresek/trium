import { useMemo } from "react";

import { useData } from "../data/DataProvider";
import type { Note } from "../types";

function noteOrder(left: Note, right: Note) {
  return (
    right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id)
  );
}

export function useNotes() {
  const {
    notes: allNotes,
    notesLoading,
    notesError,
    retryNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useData();

  const notes = useMemo(
    () => [...allNotes].sort(noteOrder),
    [allNotes],
  );

  return {
    notes,
    loading: notesLoading,
    error: notesError,
    retry: retryNotes,
    createNote,
    updateNote,
    deleteNote,
  };
}
