import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import type { Todo } from "./types.js";
import { generateId } from "./utils.js";

const DATA_DIR = path.join(os.homedir(), ".simple-todos");
const STORE_PATH = path.join(DATA_DIR, "todos.json");
const BACKUP_PATH = path.join(DATA_DIR, "todos.json.bak");

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  }
}

function migrateLegacyStore(): void {
  // Support legacy store path (alongside the source code)
  const dirname = path.dirname(new URL(import.meta.url).pathname);
  const legacyPath = path.resolve(dirname, "..", "todos.json");
  if (fs.existsSync(legacyPath) && !fs.existsSync(STORE_PATH)) {
    ensureDir();
    fs.copyFileSync(legacyPath, STORE_PATH);
    try { fs.unlinkSync(legacyPath); } catch { /* ignore */ }
  }
}

function readFileSafe(): string | null {
  try {
    return fs.readFileSync(STORE_PATH, "utf-8");
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export function loadTodos(): Todo[] {
  migrateLegacyStore();
  ensureDir();

  const raw = readFileSafe();
  if (raw === null) return [];

  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) {
      console.error("todos.json: data is not an array, resetting.");
      return [];
    }
    return data as Todo[];
  } catch (err) {
    // Attempt recovery from backup
    const backupRaw = readFileSafe();
    if (backupRaw !== null) {
      try {
        const backupData = JSON.parse(backupRaw);
        if (Array.isArray(backupData)) {
          console.error("todos.json was corrupted; recovered from backup.");
          fs.writeFileSync(STORE_PATH, backupRaw, "utf-8");
          return backupData as Todo[];
        }
      } catch { /* backup also corrupted */ }
    }

    console.error("todos.json is corrupted and unrecoverable; starting fresh.");
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  ensureDir();
  const content = JSON.stringify(todos, null, 2);

  // Keep a backup of the current file before overwriting
  if (fs.existsSync(STORE_PATH)) {
    try {
      fs.copyFileSync(STORE_PATH, BACKUP_PATH);
    } catch { /* backup is best-effort */ }
  }

  // Atomic write: write to temp file, then rename
  const tmpPath = path.join(DATA_DIR, `todos.tmp.${process.pid}`);
  fs.writeFileSync(tmpPath, content, "utf-8");
  fs.renameSync(tmpPath, STORE_PATH);
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
