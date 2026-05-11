import React from "react";
import { Text, Box } from "ink";
import type { Todo } from "../types.js";
import TodoItem from "./TodoItem.js";

interface Props {
  todos: Todo[];
}

export default function TodoList({ todos }: Props) {
  if (todos.length === 0) {
    return <Text color="gray">No tasks. Use "todo add &lt;description&gt;" to create one.</Text>;
  }

  const doneCount = todos.filter((t) => t.done).length;

  return (
    <Box flexDirection="column">
      <Text bold>
        Todo List ({todos.length} task{todos.length !== 1 ? "s" : ""})
      </Text>
      <Box marginTop={1} flexDirection="column">
        {todos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color="gray">
          {doneCount}/{todos.length} completed
        </Text>
      </Box>
    </Box>
  );
}
