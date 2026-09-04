import { useState } from "react";

import { DayGrid } from "../components/DayGrid";
import { Dialog } from "../components/Dialog";
import { EmptyCta } from "../components/EmptyCta";
import { NoteCard } from "../components/NoteCard";
import { NoteForm } from "../components/NoteForm";
import { TaskForm } from "../components/TaskForm";
import { TaskItem } from "../components/TaskItem";
import { useBlocksAroundNow } from "../hooks/useBlocksAroundNow";
import { useNotes } from "../hooks/useNotes";
import { useNow } from "../hooks/useNow";
import { useTasks } from "../hooks/useTasks";
import {
  formatTimeLabel,
  WARSAW_TIME_ZONE,
  warsawDateValue,
  warsawGreeting,
} from "../time";

const HOME_OPEN_TASK_LIMIT = 4;

export function HomePage() {
  const now = useNow();
  const dateValue = warsawDateValue(now);
  const {
    tasks,
    loading,
    error,
    retry,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(dateValue);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = tasks.find((task) => task.id === editingId);
  const openTasks = tasks.filter((task) => !task.done);
  const visibleTasks = openTasks.slice(0, HOME_OPEN_TASK_LIMIT);
  const {
    notes,
    loading: notesLoading,
    error: notesError,
    retry: retryNotes,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();
  const [creatingNote, setCreatingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const editingNote = notes.find((note) => note.id === editingNoteId);
  const {
    occurrences,
    rangeStartMinutes,
    rangeEndMinutes,
    nowMinutes,
    loading: blocksLoading,
    error: blocksError,
    retry: retryBlocks,
  } = useBlocksAroundNow();
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
          {warsawGreeting(now)}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          Start with one thing that matters today.
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        <section
          aria-busy={blocksLoading}
          aria-labelledby="around-now-heading"
          className="lg:col-start-2 lg:row-start-1"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium" id="around-now-heading">
              Around now
            </h2>
          </div>
          {blocksError ? (
            <div
              className="mb-3 flex items-center justify-between gap-4 rounded-md border border-rust/40 bg-paper-raised p-4 text-sm text-rust"
              role="alert"
            >
              <span>{blocksError}</span>
              <button
                className="rounded-md border border-rust/40 px-3 py-1.5"
                onClick={() => void retryBlocks()}
                type="button"
              >
                Retry
              </button>
            </div>
          ) : null}
          {blocksLoading ? (
            <p className="text-sm text-ink-soft" role="status">
              Loading nearby blocks…
            </p>
          ) : (
            <DayGrid
              blocks={occurrences.map((occurrence) => ({
                id: occurrence.block.id,
                title: occurrence.block.title,
                description: occurrence.block.description,
                startLabel: formatTimeLabel(occurrence.block.start),
                endLabel: formatTimeLabel(occurrence.block.end),
                startMinutes: occurrence.startMinutes,
                endMinutes: occurrence.endMinutes,
              }))}
              label="Around now"
              nowMinutes={nowMinutes}
              pixelsPerHour={40}
              rangeEndMinutes={rangeEndMinutes}
              rangeStartMinutes={rangeStartMinutes}
              readOnly
            />
          )}
        </section>

        <section
          aria-busy={loading}
          aria-labelledby="todays-tasks-heading"
          className="lg:col-start-1 lg:row-start-1"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium" id="todays-tasks-heading">
              Today’s tasks
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-faint">
                {openTasks.length} {openTasks.length === 1 ? "task" : "tasks"}
              </span>
              {openTasks.length > 0 ? (
                <button
                  className="shrink-0 rounded-md bg-moss px-3 py-1.5 text-sm font-medium text-paper-raised hover:bg-moss-hover"
                  onClick={() => {
                    setEditingId(null);
                    setCreating(true);
                  }}
                  type="button"
                >
                  Add task
                </button>
              ) : null}
            </div>
          </div>
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
            <Dialog onClose={() => setCreating(false)} title="Add task">
              <TaskForm
                defaultDate={dateValue}
                onCancel={() => setCreating(false)}
                onSubmit={async (payload) => {
                  await createTask(payload);
                  setCreating(false);
                }}
                submitLabel="Create task"
              />
            </Dialog>
          ) : null}
          {editing ? (
            <Dialog onClose={() => setEditingId(null)} title="Edit task">
              <TaskForm
                initial={editing}
                onCancel={() => setEditingId(null)}
                onSubmit={async (payload) => {
                  await updateTask(editing.id, payload);
                  setEditingId(null);
                }}
                submitLabel="Save changes"
              />
            </Dialog>
          ) : null}
          {loading ? (
            <p className="text-sm text-ink-soft" role="status">
              Loading today’s tasks…
            </p>
          ) : openTasks.length === 0 ? (
            <EmptyCta
              description="Give today a clear starting point."
              onClick={() => setCreating(true)}
              title="Add your first task"
            />
          ) : (
            <div className="space-y-3">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => {
                    setCreating(false);
                    setEditingId(task.id);
                  }}
                  onToggle={() => updateTask(task.id, { done: !task.done })}
                  showDate={false}
                  task={task}
                />
              ))}
            </div>
          )}
        </section>

        <section
          aria-busy={notesLoading}
          aria-labelledby="recent-notes-heading"
          className="lg:col-span-2 lg:row-start-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-medium" id="recent-notes-heading">
              Recent notes
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink-faint">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </span>
              {notes.length > 0 ? (
                <button
                  className="shrink-0 rounded-md bg-moss px-3 py-1.5 text-sm font-medium text-paper-raised hover:bg-moss-hover"
                  onClick={() => {
                    setEditingNoteId(null);
                    setCreatingNote(true);
                  }}
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
            <Dialog onClose={() => setCreatingNote(false)} title="Add note">
              <NoteForm
                onCancel={() => setCreatingNote(false)}
                onSubmit={async (payload) => {
                  await createNote(payload);
                  setCreatingNote(false);
                }}
                submitLabel="Create note"
              />
            </Dialog>
          ) : null}
          {editingNote ? (
            <Dialog onClose={() => setEditingNoteId(null)} title="Edit note">
              <NoteForm
                initial={editingNote}
                onCancel={() => setEditingNoteId(null)}
                onSubmit={async (payload) => {
                  await updateNote(editingNote.id, payload);
                  setEditingNoteId(null);
                }}
                submitLabel="Save changes"
              />
            </Dialog>
          ) : null}
          {notesLoading ? (
            <p className="text-sm text-ink-soft" role="status">
              Loading recent notes…
            </p>
          ) : notes.length === 0 ? (
            <EmptyCta
              description="Keep an idea close to the rest of your day."
              onClick={() => setCreatingNote(true)}
              title="Add your first note"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {notes.slice(0, 4).map((note) => (
                <NoteCard
                  compact
                  key={note.id}
                  note={note}
                  onDelete={() => deleteNote(note.id)}
                  onEdit={() => {
                    setCreatingNote(false);
                    setEditingNoteId(note.id);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
