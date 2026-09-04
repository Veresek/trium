import { useMemo } from "react";

import { useData } from "../data/DataProvider";
import { blockSegmentsOnDay } from "../time";
import type { TimeBlock } from "../types";

function blockOrder(left: TimeBlock, right: TimeBlock) {
  return (
    left.start.localeCompare(right.start) ||
    left.end.localeCompare(right.end) ||
    left.id.localeCompare(right.id)
  );
}

export function useBlocks(dates: readonly string[]) {
  const {
    blocks: allBlocks,
    blocksLoading,
    blocksError,
    retryBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
  } = useData();
  const datesKey = dates.join(",");

  const blocks = useMemo(() => {
    const range = datesKey.split(",").filter(Boolean);
    return allBlocks
      .filter((block) =>
        range.some((date) => blockSegmentsOnDay(block, date).length > 0),
      )
      .sort(blockOrder);
  }, [allBlocks, datesKey]);

  return {
    blocks,
    loading: blocksLoading,
    error: blocksError,
    retry: retryBlocks,
    createBlock,
    updateBlock,
    deleteBlock,
  };
}
