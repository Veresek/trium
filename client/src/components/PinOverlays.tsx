import { useCallback, useState } from "react";

import { ItemSheet } from "./ItemSheet";
import { OccurrenceSheet } from "./OccurrenceSheet";

export interface PinsOverlay {
  blockId: string;
  date: string;
}

export interface ItemOverlay {
  kind: "task" | "note";
  id: string;
  mode: "read" | "edit";
}

export function usePinOverlays() {
  const [pins, setPins] = useState<PinsOverlay | null>(null);
  const [item, setItem] = useState<ItemOverlay | null>(null);

  const openTask = useCallback((id: string, mode: "read" | "edit" = "read") => {
    setItem({ kind: "task", id, mode });
  }, []);

  const openNote = useCallback((id: string, mode: "read" | "edit" = "read") => {
    setItem({ kind: "note", id, mode });
  }, []);

  const openPins = useCallback((blockId: string, date: string) => {
    setPins({ blockId, date });
  }, []);

  const overlay = (
    <PinOverlays
      item={item}
      onItemChange={setItem}
      onPinsChange={setPins}
      pins={pins}
    />
  );

  return {
    overlay,
    openTask,
    openNote,
    openPins,
    closePins: () => setPins(null),
    closeItem: () => setItem(null),
    closeAll: () => {
      setPins(null);
      setItem(null);
    },
  };
}

function PinOverlays({
  pins,
  item,
  onPinsChange,
  onItemChange,
}: {
  pins: PinsOverlay | null;
  item: ItemOverlay | null;
  onPinsChange: (value: PinsOverlay | null) => void;
  onItemChange: (value: ItemOverlay | null) => void;
}) {
  return (
    <>
      {pins ? (
        <OccurrenceSheet
          blockId={pins.blockId}
          date={pins.date}
          onClose={() => onPinsChange(null)}
          onOpenNote={(id) => onItemChange({ kind: "note", id, mode: "read" })}
          onOpenTask={(id) => onItemChange({ kind: "task", id, mode: "read" })}
        />
      ) : null}
      {item ? (
        <ItemSheet
          id={item.id}
          kind={item.kind}
          mode={item.mode}
          onClose={() => onItemChange(null)}
          onModeChange={(mode) => onItemChange({ ...item, mode })}
          onOpenBlock={(blockId, date) => onPinsChange({ blockId, date })}
          onOpenTask={(id) =>
            onItemChange({ kind: "task", id, mode: "read" })
          }
        />
      ) : null}
    </>
  );
}
