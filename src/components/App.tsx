import React, { useState, useEffect } from "react";
import { Text, Box, useInput } from "ink";
import { handleCommand, type CommandResult } from "../commands.js";
import { loadTodos } from "../store.js";
import TodoList from "./TodoList.js";
import Prompt from "./Prompt.js";

function renderFeedback(result: CommandResult): React.ReactNode {
  switch (result.type) {
    case "added":
      return <Text color="green">✓ Added: {result.todo.description}</Text>;
    case "deleted":
      return <Text color="red">✗ Deleted: {result.todo.description}</Text>;
    case "toggled":
      return (
        <Text color={result.todo.done ? "green" : "yellow"}>
          {result.todo.done ? "☑" : "☐"} {result.todo.description}
          {result.todo.done ? " (completed)" : " (marked incomplete)"}
        </Text>
      );
    case "cleared":
      return result.count > 0
        ? <Text color="green">✓ Removed {result.count} completed task{result.count !== 1 ? "s" : ""}.</Text>
        : <Text color="gray">No completed tasks to clear.</Text>;
    case "error":
      return <Text color="red">{result.message}</Text>;
    default:
      return null;
  }
}

export default function App() {
  const [todos, setTodos] = useState(() => loadTodos());
  const [inputBuffer, setInputBuffer] = useState("");
  const [message, setMessage] = useState<React.ReactNode>(null);

  // Clear feedback message when user starts typing a new command
  useEffect(() => {
    if (inputBuffer.length > 0) {
      setMessage(null);
    }
  }, [inputBuffer]);

  useInput((input, key) => {
    if ((key.ctrl && (input === "c" || input === "d"))) {
      process.exit(0);
    }

    if (key.return) {
      const trimmed = inputBuffer.trim();
      if (!trimmed) return;

      if (["exit", "quit"].includes(trimmed)) {
        process.exit(0);
      }

      const args = trimmed.split(/\s+/);
      const result = handleCommand(args);
      setMessage(renderFeedback(result));
      setTodos(loadTodos());
      setInputBuffer("");
      return;
    }

    if (key.backspace || key.delete) {
      setInputBuffer((prev) => prev.slice(0, -1));
      return;
    }

    if (!key.ctrl && !key.meta && input) {
      setInputBuffer((prev) => prev + input);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <TodoList todos={todos} />
      {message && (
        <Box marginTop={1}>
          {message}
        </Box>
      )}
      <Box marginTop={1}>
        <Prompt value={inputBuffer} />
      </Box>
    </Box>
  );
}
