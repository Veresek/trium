import { useState, type FormEvent } from "react";

import type { TaskCreate } from "../types";

interface TaskFormProps {
  initial?: {
    title: string;
    description: string;
    date: string | null;
  };
  defaultDate?: string;
  submitLabel: string;
  onSubmit: (payload: TaskCreate) => Promise<unknown>;
  onCancel?: () => void;
}

export function TaskForm({
  initial,
  defaultDate,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedTitle = title.trim();
    if (!normalizedTitle) {
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        title: normalizedTitle,
        description: description.trim(),
        date: date || null,
      });
      if (!initial) {
        setTitle("");
        setDescription("");
        if (!defaultDate) {
          setDate("");
        }
      }
    } catch {
      // The shared task state renders the API error.
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-ink" htmlFor="task-title">
        Title
      </label>
      <input
        className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-lichen"
        id="task-title"
        maxLength={255}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What needs doing?"
        required
        value={title}
      />

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_11rem]">
        <div>
          <label
            className="block text-sm font-medium text-ink"
            htmlFor="task-description"
          >
            Description
          </label>
          <textarea
            className="mt-1 min-h-24 w-full resize-y rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-lichen"
            id="task-description"
            maxLength={10000}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add useful context. Markdown is welcome."
            value={description}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-ink"
            htmlFor="task-date"
          >
            Date
          </label>
          <input
            className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-lichen"
            id="task-date"
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </div>
      </div>

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
