import type { Note } from "../types";

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
  return (
    <article className="rounded-lg border border-line bg-paper-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 font-serif text-xl text-ink">{note.title}</h3>
        {onEdit || onDelete ? (
          <div className="flex shrink-0 gap-2">
            {onEdit ? (
              <button
                aria-label={`Edit ${note.title}`}
                className="rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:bg-paper"
                onClick={onEdit}
                type="button"
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                aria-label={`Delete ${note.title}`}
                className="rounded-md border border-line px-2.5 py-1.5 text-xs text-rust hover:bg-paper"
                onClick={() => void onDelete().catch(() => undefined)}
                type="button"
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {note.markdown ? (
        <p
          className={[
            "mt-3 whitespace-pre-wrap wrap-break-word text-sm leading-6 text-ink-soft",
            compact ? "line-clamp-6" : "",
          ].join(" ")}
        >
          {note.markdown}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-ink-faint">Empty note</p>
      )}
      <p className="mt-4 text-xs text-ink-faint">
        Edited {displayUpdatedAt(note.updatedAt)}
      </p>
    </article>
  );
}
