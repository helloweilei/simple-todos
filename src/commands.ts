import type { Todo } from "./types.js";
import {
  addTodo,
  deleteTodo,
  toggleTodo,
  clearDone,
  loadTodos,
} from "./store.js";

export type CommandResult =
  | { type: "list"; todos: Todo[]; options?: { done?: boolean } }
  | { type: "added"; todo: Todo; todos: Todo[] }
  | { type: "deleted"; todo: Todo; todos: Todo[] }
  | { type: "toggled"; todo: Todo; todos: Todo[] }
  | { type: "cleared"; count: number; todos: Todo[] }
  | { type: "error"; message: string };

const helpText = `
Usage: todo <command> [arguments]

Commands:
  add <description>    Add a new task
  list                 Show all tasks (default)
  done <id>            Toggle task completion
  del <id>             Delete a task
  clear                Remove all completed tasks
  help                 Show this help
`;

export function handleCommand(args: string[]): CommandResult {
  const cmd = args[0]?.toLowerCase() ?? "list";
  const options: Record<string, string> =
    args.length > 1
      ? args
          .slice(1)
          .map((arg) => arg.split("="))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      : { done: "false" };

  switch (cmd) {
    case "list": {
      const todos = loadTodos();
      const includeDone = options.done === "true";
      return {
        type: "list",
        todos: includeDone ? todos : todos.filter((t) => !t.done),
      };
    }

    case "add": {
      const desc = args.slice(1).join(" ").trim();
      if (!desc) {
        return {
          type: "error",
          message: "Error: missing description.\nUsage: todo add <description>",
        };
      }
      const todo = addTodo(desc);
      return { type: "added", todo, todos: loadTodos() };
    }

    case "done": {
      const id = args[1];
      if (!id) {
        return {
          type: "error",
          message: "Error: missing task id.\nUsage: todo done <id>",
        };
      }
      const toggled = toggleTodo(id);
      if (!toggled) {
        return { type: "error", message: `Error: task "${id}" not found.` };
      }
      return { type: "toggled", todo: toggled, todos: loadTodos() };
    }

    case "del": {
      const id = args[1];
      if (!id) {
        return {
          type: "error",
          message: "Error: missing task id.\nUsage: todo del <id>",
        };
      }
      const removed = deleteTodo(id);
      if (!removed) {
        return { type: "error", message: `Error: task "${id}" not found.` };
      }
      return { type: "deleted", todo: removed, todos: loadTodos() };
    }

    case "clear": {
      const count = clearDone();
      return { type: "cleared", count, todos: loadTodos() };
    }

    case "help": {
      return { type: "error", message: helpText };
    }

    default: {
      return {
        type: "error",
        message: `Error: unknown command "${cmd}".\nUse "todo help" to see available commands.`,
      };
    }
  }
}
