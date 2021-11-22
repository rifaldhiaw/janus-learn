import { Flex, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import React, { useEffect } from "react";
import InputField from "../src/components/InputField";
import {
  useJanusSessionService,
  useJanusTextRoomService,
} from "../src/domain/janus/janusProvider";
import { JanusSessionState } from "../src/domain/janus/janusSessionMachine";
import { useTextRoomStore } from "../src/domain/janus/janusTextRoomMachine";
import ChatRoom from "../src/ui/textRoom/ChatRoom";
import { useJanusInit } from "../src/utils";

const TextRoom: NextPage = () => {
  useJanusInit();

  const [janusSessionState] = useJanusSessionService();
  const [textRoomState, textRoomSend] = useJanusTextRoomService();
  const joinTextRoom = useTextRoomStore((s) => s.joinRoom);
  const hasJoin = useTextRoomStore((s) => s.hasJoin);

  useEffect(() => {
    if (janusSessionState.matches("ready") && janusSessionState.context.janus) {
      textRoomSend({
        type: "ATTACH_TEXTROOM_PLUGIN",
        janus: janusSessionState.context.janus,
      });
    }
  }, [janusSessionState, textRoomSend]);

  const hanldeRegister = (name: string) => {
    if (textRoomState.matches("runningTextRoomPlugin.receivingData")) {
      joinTextRoom(name);
    }
  };

  const renderContent = () => {
    switch (janusSessionState.value as JanusSessionState) {
      case "idle":
        return <Text>Idle</Text>;

      case "creating":
        return <Text>creating</Text>;

      case "ready":
        return <InputField inSubmit={hanldeRegister} placeholder="Username" />;

      case "error":
        return <Text>error</Text>;

      case "destroyed":
        return <Text>plugin destroyed</Text>;
    }
  };

  return (
    <Flex height="100vh" justify="center" align="center">
      {hasJoin ? <ChatRoom /> : renderContent()}
    </Flex>
  );
};

export default TextRoom;
