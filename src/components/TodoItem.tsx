import React from "react";
import { Text } from "ink";
import type { Todo } from "../types.js";
import { truncateId } from "../utils.js";

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  const date = new Date(todo.createdAt).toLocaleDateString();
  const status = todo.done ? "☑" : "☐";

  return (
    <Text>
      <Text color="gray">[{truncateId(todo.id)}]</Text>{" "}
      <Text color={todo.done ? "green" : "yellow"} strikethrough={todo.done}>
        {status} {todo.description}
      </Text>{" "}
      <Text color="gray">({date})</Text>
    </Text>
  );
}
