export type Recurrence = "none" | "daily" | "weekly" | "weekdays";

export interface User {
  id: string;
  email: string;
  verifiedAt: string | null;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  date: string | null;
  timeBlockId: string | null;
  order: number;
  createdAt: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  done?: boolean;
  date?: string | null;
  timeBlockId?: string | null;
  order?: number;
}

export type TaskUpdate = Partial<TaskCreate>;

export interface TimeBlock {
  id: string;
  title: string;
  description: string;
  date: string;
  start: string;
  end: string;
  recurrence: Recurrence;
  recurrenceDays: number[];
}

export interface TimeBlockCreate {
  title: string;
  description?: string;
  date: string;
  start: string;
  end: string;
  recurrence?: Recurrence;
  recurrenceDays?: number[];
}

export type TimeBlockUpdate = Partial<TimeBlockCreate>;

export interface Note {
  id: string;
  title: string;
  markdown: string;
  updatedAt: string;
  taskId: string | null;
}

export interface NoteCreate {
  title: string;
  markdown?: string;
  taskId?: string | null;
}

export type NoteUpdate = Partial<NoteCreate>;

export interface CollectionFingerprint {
  count: number;
  updatedAt: string | null;
}

export interface AppState {
  tasks: CollectionFingerprint;
  notes: CollectionFingerprint;
  blocks: CollectionFingerprint;
}
