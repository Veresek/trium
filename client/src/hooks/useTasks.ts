import { useMemo } from "react";

import { useData } from "../data/DataProvider";
import type { Task } from "../types";

function taskOrder(left: Task, right: Task) {
  return (
    Number(left.done) - Number(right.done) ||
    left.order - right.order ||
    left.createdAt.localeCompare(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

export function useTasks(date?: string | "undated") {
  const {
    tasks: allTasks,
    tasksLoading,
    tasksError,
    retryTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useData();

  const tasks = useMemo(() => {
    const filtered =
      date === undefined
        ? allTasks
        : date === "undated"
          ? allTasks.filter((task) => task.date === null)
          : allTasks.filter((task) => task.date === date);
    return [...filtered].sort(taskOrder);
  }, [allTasks, date]);

  return {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    retry: retryTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
