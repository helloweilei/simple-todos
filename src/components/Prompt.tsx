import React, { useEffect, useState } from "react";
import { Box, Text } from "ink";

interface Props {
  value: string;
}

export default function Prompt({ value }: Props) {
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 530);
    return () => {
      clearInterval(id);
    };
  }, []);

  return (
    <Box flexDirection="row" flexWrap="nowrap">
      <Text bold>&gt; </Text>
      <Text>{value}</Text>
      <Text inverse={cursorOn} dimColor={!cursorOn}>█</Text>
    </Box>
  );
}
