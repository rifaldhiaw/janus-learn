import { Box, Divider, Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";
import InputField from "../../components/InputField";
import { useTextRoomStore } from "../../domain/janus/janusTextRoomMachine";

export default function ChatRoom() {
  const chat = useTextRoomStore((s) => s.chat);
  const textRoom = useTextRoomStore((s) => s.textRoom);
  const sendMsg = useTextRoomStore((s) => s.sendMsg);

  const handleEnter = (msg: string) => {
    if (msg != "" && textRoom) {
      sendMsg(msg);
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
          {chat.map((v, i) => (
            <Text key={i}>{v}</Text>
          ))}
        </Box>

        <InputField inSubmit={handleEnter} placeholder="Write Message" />
      </Stack>
    </Flex>
  );
}
