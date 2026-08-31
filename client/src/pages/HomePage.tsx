import { useState } from "react";

import { EmptyCta } from "../components/EmptyCta";
import { NoteCard } from "../components/NoteCard";
import { NoteForm } from "../components/NoteForm";
import { TaskForm } from "../components/TaskForm";
import { TaskItem } from "../components/TaskItem";
import { useNotes } from "../hooks/useNotes";
import { useTasks } from "../hooks/useTasks";

const hours = ["- 1h", "Now", "+ 1h", "+ 2h", "+ 3h"];
const WARSAW_TIME_ZONE = "Europe/Warsaw";

function warsawDateValue(value: Date) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: WARSAW_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);
  const valueFor = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const year = valueFor("year");
  const month = valueFor("month");
  const day = valueFor("day");
  return `${year}-${month}-${day}`;
}

function greeting(value: Date) {
  const hour = Number(
    new Intl.DateTimeFormat("en", {
      timeZone: WARSAW_TIME_ZONE,
      hour: "numeric",
      hourCycle: "h23",
    }).format(value),
  );
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

export function HomePage() {
  const now = new Date();
  const dateValue = warsawDateValue(now);
  const {
    tasks,
    loading,
    error,
    usingFallback,
    retry,
    createTask,
    updateTask,
  } = useTasks(dateValue, { fallbackToAll: true });
  const [creating, setCreating] = useState(false);
  const {
    notes,
    loading: notesLoading,
    error: notesError,
    retry: retryNotes,
    createNote,
  } = useNotes();
  const [creatingNote, setCreatingNote] = useState(false);
  const dateAndTime = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: WARSAW_TIME_ZONE,
  }).format(now);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <header>
        <p className="text-sm text-ink-soft">{dateAndTime}</p>
        <h1 className="mt-2 font-serif text-3xl md:text-4xl">
          {greeting(now)}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Start with one thing that matters today.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <section className="lg:col-start-2 lg:row-start-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Around now</h2>
            <span className="text-xs text-ink-faint">Unavailable</span>
          </div>
          <div className="overflow-hidden rounded-lg border border-line bg-paper-raised">
            {hours.map((hour, index) => (
              <div
                key={hour}
                className={[
                  "grid min-h-10 grid-cols-[5rem_1fr] items-center",
                  index > 0 ? "border-t border-line/80" : "",
                ].join(" ")}
              >
                <span
                  className={[
                    "px-3 text-[0.7rem]",
                    hour === "Now" ? "text-moss" : "text-ink-faint",
                  ].join(" ")}
                >
                  {hour}
                </span>
                <span className="h-px bg-line" />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Time blocks are unavailable.
          </p>
        </section>

        <section
          aria-busy={loading}
          className="lg:col-start-1 lg:row-start-1"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Today’s tasks</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-faint">
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
              </span>
              {tasks.length > 0 ? (
                <button
                  className="text-xs font-medium text-moss hover:text-moss-hover"
                  onClick={() => setCreating(true)}
                  type="button"
                >
                  Add task
                </button>
              ) : null}
            </div>
          </div>
          {usingFallback ? (
            <p className="mb-3 text-sm text-ink-soft" role="status">
              No tasks for today — showing your other tasks.
            </p>
          ) : null}
          {error ? (
            <div
              className="mb-3 flex items-center justify-between gap-4 rounded-md border border-rust/40 bg-paper-raised p-4 text-sm text-rust"
              role="alert"
            >
              <span>{error}</span>
              <button
                className="rounded-md border border-rust/40 px-3 py-1.5"
                onClick={() => void retry()}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : null}
          {creating ? (
            <TaskForm
              defaultDate={dateValue}
              onCancel={() => setCreating(false)}
              onSubmit={async (payload) => {
                await createTask(payload);
                setCreating(false);
              }}
              showDetails={false}
              submitLabel="Add to today"
            />
          ) : null}
          {loading ? (
            <p className="text-sm text-ink-soft" role="status">
              Loading today’s tasks…
            </p>
          ) : tasks.length === 0 && !creating ? (
            <EmptyCta
              description="Give today a clear starting point."
              onClick={() => setCreating(true)}
              title="Add your first task"
            />
          ) : (
            <div className={creating ? "mt-3 space-y-3" : "space-y-3"}>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  onToggle={() => updateTask(task.id, { done: !task.done })}
                  task={task}
                />
              ))}
            </div>
          )}
        </section>

        <section
          aria-busy={notesLoading}
          className="lg:col-span-2 lg:row-start-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium">Recent notes</h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-faint">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
              {notes.length > 0 ? (
                <button
                  className="text-xs font-medium text-moss hover:text-moss-hover"
                  onClick={() => setCreatingNote(true)}
                  type="button"
                >
                  Add note
                </button>
              ) : null}
            </div>
          </div>
          {notesError ? (
            <div
              className="mb-3 flex items-center justify-between gap-4 rounded-md border border-rust/40 bg-paper-raised p-4 text-sm text-rust"
              role="alert"
            >
              <span>{notesError}</span>
              <button
                className="rounded-md border border-rust/40 px-3 py-1.5"
                onClick={() => void retryNotes()}
                type="button"
              >
                Retry notes
              </button>
            </div>
          ) : null}
          {creatingNote ? (
            <NoteForm
              onCancel={() => setCreatingNote(false)}
              onSubmit={async (payload) => {
                await createNote(payload);
                setCreatingNote(false);
              }}
              submitLabel="Create note"
            />
          ) : null}
          {notesLoading ? (
            <p className="text-sm text-ink-soft">Loading recent notes…</p>
          ) : notes.length === 0 && !creatingNote ? (
            <EmptyCta
              description="Keep an idea close to the rest of your day."
              onClick={() => setCreatingNote(true)}
              title="Add your first note"
            />
          ) : (
            <div
              className={[
                "grid gap-4 md:grid-cols-2",
                creatingNote ? "mt-4" : "",
              ].join(" ")}
            >
              {notes.slice(0, 4).map((note) => (
                <NoteCard compact key={note.id} note={note} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
