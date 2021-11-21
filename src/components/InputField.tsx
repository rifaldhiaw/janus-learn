import { Button, HStack, Input } from "@chakra-ui/react";
import React, { useState } from "react";

export default function InputField(props: {
  placeholder: string;
  inSubmit: (v: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    props.inSubmit(value);
    setValue("");
  };

  return (
    <HStack>
      <Input
        placeholder={props.placeholder}
        flex={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />
      <Button onClick={handleSubmit} colorScheme="blue">
        Enter
      </Button>
    </HStack>
  );
}
