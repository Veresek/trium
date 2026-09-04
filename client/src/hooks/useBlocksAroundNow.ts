import { useMemo } from "react";

import { useData } from "../data/DataProvider";
import { aroundNowWindow, blockSegmentsOnDay, calendarDayOffset } from "../time";
import type { TimeBlock } from "../types";
import { useNow } from "./useNow";

export interface BlockOccurrence {
  block: TimeBlock;
  occurrenceDate: string;
  startMinutes: number;
  endMinutes: number;
}

export function useBlocksAroundNow() {
  const now = useNow();
  const window = aroundNowWindow(now);
  const { blocks, blocksLoading, blocksError, retryBlocks } = useData();

  const occurrences = useMemo(() => {
    const current = aroundNowWindow(now);
    const next: BlockOccurrence[] = [];
    for (const date of current.dates) {
      const dayOffset = calendarDayOffset(current.originDate, date) * 1440;
      for (const block of blocks) {
        for (const segment of blockSegmentsOnDay(block, date)) {
          const startMinutes = dayOffset + segment.startMinutes;
          const endMinutes = dayOffset + segment.endMinutes;
          if (
            endMinutes <= current.rangeStartMinutes ||
            startMinutes >= current.rangeEndMinutes
          ) {
            continue;
          }
          next.push({
            block,
            occurrenceDate: date,
            startMinutes,
            endMinutes,
          });
        }
      }
    }
    return next;
  }, [blocks, now]);

  return {
    occurrences,
    rangeStartMinutes: window.rangeStartMinutes,
    rangeEndMinutes: window.rangeEndMinutes,
    nowMinutes: window.nowMinutes,
    loading: blocksLoading,
    error: blocksError,
    retry: retryBlocks,
  };
}
