import { useState, type FormEvent } from "react";

import type { NoteCreate } from "../types";

interface NoteFormProps {
  initial?: {
    title: string;
    markdown: string;
  };
  submitLabel: string;
  onSubmit: (payload: NoteCreate) => Promise<unknown>;
  onCancel?: () => void;
}

export function NoteForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [markdown, setMarkdown] = useState(initial?.markdown ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({ title: normalizedTitle, markdown });
      if (!initial) {
        setTitle("");
        setMarkdown("");
      }
    } catch {
      // The shared note state renders the API error.
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="rounded-lg border border-line bg-paper-raised p-4"
      onSubmit={handleSubmit}
    >
      <label className="block text-sm font-medium text-ink" htmlFor="note-title">
        Title
      </label>
      <input
        autoFocus
        className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-lichen"
        id="note-title"
        maxLength={255}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Name this note"
        required
        value={title}
      />

      <label
        className="mt-4 block text-sm font-medium text-ink"
        htmlFor="note-markdown"
      >
        Markdown
      </label>
      <textarea
        className="mt-1 min-h-52 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 font-mono text-sm leading-6 text-ink focus:border-lichen"
        id="note-markdown"
        maxLength={100000}
        onChange={(event) => setMarkdown(event.target.value)}
        placeholder="Write anything. Markdown is welcome."
        value={markdown}
      />

      <div className="mt-4 flex justify-end gap-2">
        {onCancel ? (
          <button
            className="rounded-md border border-line px-3 py-2 text-sm text-ink-soft hover:bg-paper"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
        <button
          className="rounded-md bg-moss px-4 py-2 text-sm font-medium text-paper-raised hover:bg-moss-hover disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
          type="submit"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
