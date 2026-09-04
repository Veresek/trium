import { useState } from "react";

import type { Note } from "../types";
import { ConfirmDelete } from "./ConfirmDelete";
import { ItemMenu } from "./ItemMenu";
import { MarkdownBody } from "./MarkdownBody";

interface NoteCardProps {
  note: Note;
  compact?: boolean;
  onEdit?: () => void;
  onDelete?: () => Promise<unknown>;
}

function displayUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function NoteCard({
  note,
  compact = false,
  onEdit,
  onDelete,
}: NoteCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!onDelete) {
      return;
    }
    setPending(true);
    try {
      await onDelete();
    } catch {
      setPending(false);
    }
  }

  return (
    <article className="rounded-lg border border-line bg-paper-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-serif text-xl text-ink">{note.title}</h3>
        <ItemMenu
          disabled={pending}
          label={`Actions for ${note.title}`}
          onDelete={onDelete ? () => setConfirming(true) : undefined}
          onEdit={onEdit}
        />
      </div>
      {confirming && onDelete ? (
        <ConfirmDelete
          confirmLabel="Delete note"
          description="This cannot be undone."
          onCancel={() => setConfirming(false)}
          onConfirm={() => void handleDelete()}
          pending={pending}
          title={`Delete ${note.title}?`}
        />
      ) : null}
      {note.markdown ? (
        <MarkdownBody compact={compact} markdown={note.markdown} />
      ) : (
        <p className="mt-3 text-sm italic text-ink-faint">Empty note</p>
      )}
      <p className="mt-4 text-xs text-ink-faint">
        Edited {displayUpdatedAt(note.updatedAt)}
      </p>
    </article>
  );
}
