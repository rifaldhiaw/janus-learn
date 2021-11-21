import { Box, Divider, Flex, Stack, Text } from "@chakra-ui/react";
import { Janus } from "janus-gateway";
import { useAtom } from "jotai";
import React from "react";
import InputField from "../../components/InputField";
import { room } from "../../config";
import { janusPluginAtom } from "../../domain/janus/janusPluginMachine";

export default function ChatRoom() {
  const [pluginState] = useAtom(janusPluginAtom);
  const { chats, pluginHandle } = pluginState.context;

  const handleEnter = (msg: string) => {
    if (msg != "" && pluginHandle) {
      const message = {
        textroom: "message",
        transaction: Janus.randomString(12),
        room: room,
        text: msg,
      };
      pluginHandle.data({
        text: JSON.stringify(message),
      });
    }
  };

  return (
    <Flex h="100vh" alignItems="center" justifyContent="center">
      <Stack height="70%" shadow="lg" rounded="lg" p="6">
        <Text fontWeight="bold" fontSize="lg">
          Chat Room 1234
        </Text>
        <Divider />
        <Box flex={1} overflowY="auto" my="2">
          {chats.map((v, i) => (
            <Text key={i}>{v}</Text>
          ))}
        </Box>

        <InputField inSubmit={handleEnter} placeholder="Write Message" />
      </Stack>
    </Flex>
  );
}
