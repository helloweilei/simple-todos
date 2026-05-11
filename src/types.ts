/** 1 = highest, 3 = lowest (default). */
export type TodoPriority = 1 | 2 | 3;

export interface Todo {
  id: string;
  description: string;
  done: boolean;
  createdAt: string;
  doneAt?: string;
  priority: TodoPriority;
}
