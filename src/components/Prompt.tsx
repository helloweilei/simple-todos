import React from "react";
import { Text } from "ink";

interface Props {
  value: string;
}

export default function Prompt({ value }: Props) {
  return (
    <Text>
      <Text bold>&gt; </Text>
      {value}
      <Text inverse> </Text>
    </Text>
  );
}
