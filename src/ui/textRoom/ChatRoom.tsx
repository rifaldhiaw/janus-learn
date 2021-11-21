import { Box, Text } from "@chakra-ui/react";
import { Janus } from "janus-gateway";
import { useAtom } from "jotai";
import React from "react";
import InputField from "../../components/InputField";
import { janusPluginAtom } from "../../domain/janus/janusPluginMachine";

export default function ChatRoom() {
  const [pluginState] = useAtom(janusPluginAtom);
  const { chats, pluginHandle } = pluginState.context;

  const handleEnter = (msg: string) => {
    if (msg != "" && pluginHandle) {
      const message = {
        textroom: "message",
        transaction: Janus.randomString(12),
        room: 1234,
        text: msg,
      };
      pluginHandle.data({
        text: JSON.stringify(message),
      });
    }
  };

  return (
    <Box>
      <Box h="200px">
        {chats.map((v, i) => (
          <Text key={i}>{v}</Text>
        ))}
      </Box>
      <InputField inSubmit={handleEnter} placeholder="Write Message" />
    </Box>
  );
}
