import { useState } from "react";

import type { Task } from "../types";
import { ConfirmDelete } from "./ConfirmDelete";
import { ItemMenu } from "./ItemMenu";
import { MarkdownBody } from "./MarkdownBody";

interface TaskItemProps {
  task: Task;
  onToggle: () => Promise<unknown>;
  onEdit?: () => void;
  onDelete?: () => Promise<unknown>;
  showDate?: boolean;
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  showDate = true,
}: TaskItemProps) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleToggle() {
    setPending(true);
    try {
      await onToggle();
    } catch {
      // The page banner shows the API error.
    } finally {
      setPending(false);
    }
  }

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
      <div className="flex items-center gap-3">
        <input
          aria-label={`Mark ${task.title} as ${task.done ? "not done" : "done"}`}
          checked={task.done}
          className="size-4 shrink-0 accent-moss"
          disabled={pending}
          onChange={() => void handleToggle()}
          type="checkbox"
        />
        <div className="min-w-0 flex-1">
          <h3
            className={[
              "font-medium text-ink",
              task.done ? "line-through opacity-60" : "",
            ].join(" ")}
          >
            {task.title}
          </h3>
          {task.description ? (
            <MarkdownBody
              className={
                showDate
                  ? "mt-1 wrap-break-word text-sm leading-6 text-ink-soft"
                  : "mt-0.5 wrap-break-word text-xs text-ink-faint"
              }
              compact={!showDate}
              markdown={task.description}
            />
          ) : null}
          {showDate ? (
            <p className="mt-2 text-xs text-ink-faint">
              {task.date ? displayDate(task.date) : "No date"}
            </p>
          ) : null}
        </div>
        <ItemMenu
          disabled={pending}
          label={`Actions for ${task.title}`}
          onDelete={onDelete ? () => setConfirming(true) : undefined}
          onEdit={onEdit}
        />
      </div>
      {confirming && onDelete ? (
        <ConfirmDelete
          confirmLabel="Delete task"
          description="This cannot be undone."
          onCancel={() => setConfirming(false)}
          onConfirm={() => void handleDelete()}
          pending={pending}
          title={`Delete ${task.title}?`}
        />
      ) : null}
    </article>
  );
}
