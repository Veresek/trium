import type { Task } from "../types";

interface TaskItemProps {
  task: Task;
  onToggle: () => Promise<unknown>;
  onEdit?: () => void;
  onDelete?: () => Promise<unknown>;
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
}: TaskItemProps) {
  return (
    <article className="rounded-lg border border-line bg-paper-raised p-4">
      <div className="flex items-start gap-3">
        <input
          aria-label={`Mark ${task.title} as ${task.done ? "not done" : "done"}`}
          checked={task.done}
          className="mt-1 size-4 accent-moss"
          onChange={() => void onToggle().catch(() => undefined)}
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
            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
              {task.description}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-ink-faint">
            {task.date ? displayDate(task.date) : "No date"}
          </p>
        </div>
        {onEdit || onDelete ? (
          <div className="flex shrink-0 gap-2">
            {onEdit ? (
              <button
                aria-label={`Edit ${task.title}`}
                className="rounded-md border border-line px-2.5 py-1.5 text-xs text-ink-soft hover:bg-paper"
                onClick={onEdit}
                type="button"
              >
                Edit
              </button>
            ) : null}
            {onDelete ? (
              <button
                aria-label={`Delete ${task.title}`}
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
    </article>
  );
}
