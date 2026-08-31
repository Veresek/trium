import { useCallback, useEffect, useState } from "react";

import { tasksApi } from "../api/resources";
import type { Task, TaskCreate, TaskUpdate } from "../types";

function taskOrder(left: Task, right: Task) {
  return (
    left.order - right.order ||
    left.createdAt.localeCompare(right.createdAt) ||
    left.id.localeCompare(right.id)
  );
}

interface UseTasksOptions {
  fallbackToAll?: boolean;
}

export function useTasks(
  date?: string | "undated",
  { fallbackToAll = false }: UseTasksOptions = {},
) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filteredTasks = await tasksApi.list(date ? { date } : undefined);
      if (fallbackToAll && date && filteredTasks.length === 0) {
        const allTasks = await tasksApi.list();
        setTasks(allTasks);
        setUsingFallback(allTasks.length > 0);
      } else {
        setTasks(filteredTasks);
        setUsingFallback(false);
      }
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Tasks could not be loaded.",
      );
    } finally {
      setLoading(false);
    }
  }, [date, fallbackToAll]);

  useEffect(() => {
    void load();
  }, [load]);

  const createTask = async (payload: TaskCreate) => {
    setError(null);
    try {
      const created = await tasksApi.create(payload);
      if (usingFallback && created.date === date) {
        setTasks([created]);
        setUsingFallback(false);
      } else {
        setTasks((current) => [...current, created].sort(taskOrder));
      }
      return created;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The task could not be created.",
      );
      throw caught;
    }
  };

  const updateTask = async (id: string, payload: TaskUpdate) => {
    setError(null);
    try {
      const updated = await tasksApi.update(id, payload);
      setTasks((current) =>
        current
          .map((task) => (task.id === id ? updated : task))
          .filter(
            (task) =>
              usingFallback ||
              date === undefined ||
              (date === "undated" ? task.date === null : task.date === date),
          )
          .sort(taskOrder),
      );
      return updated;
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The task could not be updated.",
      );
      throw caught;
    }
  };

  const deleteTask = async (id: string) => {
    setError(null);
    try {
      await tasksApi.remove(id);
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "The task could not be deleted.",
      );
      throw caught;
    }
  };

  return {
    tasks,
    loading,
    error,
    usingFallback,
    retry: load,
    createTask,
    updateTask,
    deleteTask,
  };
}
