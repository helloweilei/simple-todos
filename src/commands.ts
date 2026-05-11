import type { Todo, TodoPriority } from "./types.js";
import {
  addTodo,
  deleteTodo,
  toggleTodo,
  clearDone,
  loadTodos,
} from "./store.js";

export type CommandResult =
  | { type: "list"; todos: Todo[] }
  | { type: "added"; todo: Todo; todos: Todo[] }
  | { type: "deleted"; todo: Todo; todos: Todo[] }
  | { type: "toggled"; todo: Todo; todos: Todo[] }
  | { type: "cleared"; count: number; todos: Todo[] }
  | { type: "error"; message: string; todos?: Todo[] };

const helpText = `
Usage: todo <command> [arguments]

Commands:
  add [-p=1|2|3] <description>   Add a new task (priority: 1 highest, 3 lowest, default 3)
  list                             Show all tasks (default), \`list -d\` show all tasks
  done <id>                        Toggle task completion
  del <id>                         Delete a task
  clear                            Remove all completed tasks
  help                             Show this help
`;

function parseAddArgs(
  args: string[],
): { description: string; priority: TodoPriority } | { error: string } {
  const tokens = args.slice(1);
  let priority: TodoPriority = 3;
  const descParts: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]!;
    const pEq = t.match(/^-p=(\d+)$/) ?? t.match(/^--priority=(\d+)$/);
    if (pEq) {
      const n = Number(pEq[1]);
      if (n !== 1 && n !== 2 && n !== 3) {
        return {
          error: `Error: invalid priority "${pEq[1]}". Use 1 (highest), 2, or 3 (lowest).`,
        };
      }
      priority = n as TodoPriority;
      continue;
    }
    if (t === "-p" || t === "--priority") {
      const next = tokens[i + 1];
      if (!next || !/^\d+$/.test(next)) {
        return {
          error:
            "Error: missing value after -p. Example: todo add -p 1 Buy milk",
        };
      }
      i++;
      const n = Number(next);
      if (n !== 1 && n !== 2 && n !== 3) {
        return {
          error: `Error: invalid priority "${next}". Use 1 (highest), 2, or 3 (lowest).`,
        };
      }
      priority = n as TodoPriority;
      continue;
    }
    descParts.push(t);
  }

  const description = descParts.join(" ").trim();
  if (!description) {
    return {
      error:
        "Error: missing description.\nUsage: todo add [-p=1|2|3] <description>\nExample: todo add -p=1 Buy milk",
    };
  }
  return { description, priority };
}

export function handleCommand(args: string[]): CommandResult {
  const cmd = args[0]?.toLowerCase() ?? "list";
  const options: Record<string, string> =
    args.length > 1
      ? args
          .slice(1)
          .map((arg) => arg.split("="))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value ?? true }), {})
      : {};

  switch (cmd) {
    case "list": {
      const includeDone = "-d" in options;
      const todos = loadTodos(!includeDone);
      return {
        type: "list",
        todos: todos,
      };
    }

    case "add": {
      const parsed = parseAddArgs(args);
      if ("error" in parsed) {
        return { type: "error", message: parsed.error };
      }
      const todo = addTodo(parsed.description, parsed.priority);
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
