import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Todo } from "./types.js";
import { generateId } from "./utils.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.resolve(__dirname, "..", "todos.json");

function ensureFile(): void {
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, "[]", "utf-8");
  }
}

export function loadTodos(): Todo[] {
  ensureFile();
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw) as Todo[];
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(todos, null, 2), "utf-8");
}

export function addTodo(description: string): Todo {
  const todos = loadTodos();
  const todo: Todo = {
    id: generateId(),
    description,
    done: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  saveTodos(todos);
  return todo;
}

export function deleteTodo(id: string): Todo | null {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;
  const removed = todos.splice(index, 1)[0];
  saveTodos(todos);
  return removed;
}

export function toggleTodo(id: string): Todo | null {
  const todos = loadTodos();
  const todo = todos.find((t) => t.id === id);
  if (!todo) return null;
  todo.done = !todo.done;
  todo.doneAt = todo.done ? new Date().toISOString() : undefined;
  saveTodos(todos);
  return todo;
}

export function clearDone(): number {
  const todos = loadTodos();
  const before = todos.length;
  const remaining = todos.filter((t) => !t.done);
  saveTodos(remaining);
  return before - remaining.length;
}
