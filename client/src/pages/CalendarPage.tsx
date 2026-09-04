import { useMemo, useState } from "react";

import { BlockForm } from "../components/BlockForm";
import { Dialog } from "../components/Dialog";
import { Icon } from "../components/Icon";
import { WeekGrid } from "../components/WeekGrid";
import { useBlocks } from "../hooks/useBlocks";
import { useNow } from "../hooks/useNow";
import {
  addCalendarDays,
  blockSegmentsOnDay,
  formatDayHeading,
  formatTimeLabel,
  formatWeekdayShort,
  formatWeekHeading,
  startOfWeek,
  warsawDateValue,
  warsawTimeParts,
  weekDates,
} from "../time";

export function CalendarPage() {
  const now = useNow();
  const today = warsawDateValue(now);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today));
  const dates = useMemo(() => weekDates(weekStart), [weekStart]);
  const {
    blocks,
    loading,
    error,
    retry,
    createBlock,
    updateBlock,
    deleteBlock,
  } = useBlocks(dates);
  const [creatingDate, setCreatingDate] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const editing = blocks.find((block) => block.id === editingId);
  const nowParts = warsawTimeParts(now);
  const nowMinutes = nowParts.hour * 60 + nowParts.minute;
  const defaultCreateDate = dates.includes(today) ? today : weekStart;

  const closeEditors = () => {
    setCreatingDate(null);
    setEditingId(null);
  };

  return (
    <section className="mx-auto w-full max-w-[90rem] px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <header>
          <p className="text-sm text-ink-soft">Plan your time</p>
          <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">
            Calendar
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
            Lay out the week in a 24 hour grid. Repeating blocks stay one object.
          </p>
        </header>
        <button
          className="shrink-0 rounded-md bg-moss px-4 py-2 text-sm font-medium text-paper-raised hover:bg-moss-hover"
          onClick={() => {
            setEditingId(null);
            setCreatingDate(defaultCreateDate);
          }}
          type="button"
        >
          Add block
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          aria-label="Previous week"
          className="rounded-md border border-line p-2 text-ink-soft hover:bg-paper-raised"
          onClick={() => {
            closeEditors();
            setWeekStart((current) => addCalendarDays(current, -7));
          }}
          type="button"
        >
          <Icon name="chevronLeft" className="size-5" />
        </button>
        <p className="min-w-56 text-center text-sm font-medium text-ink">
          {formatWeekHeading(weekStart)}
        </p>
        <button
          aria-label="Next week"
          className="rounded-md border border-line p-2 text-ink-soft hover:bg-paper-raised"
          onClick={() => {
            closeEditors();
            setWeekStart((current) => addCalendarDays(current, 7));
          }}
          type="button"
        >
          <Icon name="chevronRight" className="size-5" />
        </button>
        {weekStart !== startOfWeek(today) ? (
          <button
            className="rounded-md border border-line px-3 py-2 text-sm text-ink-soft hover:bg-paper-raised"
            onClick={() => {
              closeEditors();
              setWeekStart(startOfWeek(today));
            }}
            type="button"
          >
            Today
          </button>
        ) : null}
      </div>

      {error ? (
        <div
          className="mt-6 flex items-center justify-between gap-4 rounded-md border border-rust/40 bg-paper-raised p-4 text-sm text-rust"
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

      {creatingDate ? (
        <Dialog onClose={() => setCreatingDate(null)} title="Add block" wide>
          <BlockForm
            defaultDate={creatingDate}
            onCancel={() => setCreatingDate(null)}
            onSubmit={async (payload) => {
              await createBlock(payload);
              setCreatingDate(null);
            }}
            submitLabel="Create block"
          />
        </Dialog>
      ) : null}

      {editing ? (
        <Dialog onClose={() => setEditingId(null)} title="Edit block" wide>
          <BlockForm
            initial={editing}
            onCancel={() => setEditingId(null)}
            onDelete={async () => {
              await deleteBlock(editing.id);
              setEditingId(null);
            }}
            onSubmit={async (payload) => {
              await updateBlock(editing.id, payload);
              setEditingId(null);
            }}
            submitLabel="Save changes"
          />
        </Dialog>
      ) : null}

      {loading ? (
        <p className="mt-8 text-sm text-ink-soft" role="status">
          Loading the week…
        </p>
      ) : (
        <div className="mt-8">
          <WeekGrid
            days={dates.map((date) => ({
              date,
              weekday: formatWeekdayShort(date),
              day: String(Number(date.slice(8))),
              label: formatDayHeading(date),
              isToday: date === today,
              blocks: blocks.flatMap((block) =>
                blockSegmentsOnDay(block, date).map((segment) => ({
                  id: block.id,
                  title: block.title,
                  description: block.description,
                  startLabel: formatTimeLabel(block.start),
                  endLabel: formatTimeLabel(block.end),
                  startMinutes: segment.startMinutes,
                  endMinutes: segment.endMinutes,
                })),
              ),
            }))}
            label={`Week of ${formatWeekHeading(weekStart)}`}
            nowMinutes={nowMinutes}
            onSelect={(id) => {
              setCreatingDate(null);
              setEditingId(id);
            }}
            onSelectDay={(date) => {
              setEditingId(null);
              setCreatingDate(date);
            }}
          />
        </div>
      )}
    </section>
  );
}
