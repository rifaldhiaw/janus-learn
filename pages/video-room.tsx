import { Flex, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import React, { useEffect } from "react";
import InputField from "../src/components/InputField";
import {
  useJanusSessionService,
  useJanusVideoRoomService,
} from "../src/domain/janus/janusProvider";
import { JanusSessionState } from "../src/domain/janus/janusSessionMachine";
import { useJanusInit } from "../src/utils";

const VideoRoom: NextPage = () => {
  useJanusInit();

  const [janusSessionState] = useJanusSessionService();
  const [videoRoomState, videoRoomSend] = useJanusVideoRoomService();
  // const joinTextRoom = useTextRoomStore((s) => s.joinRoom);
  // const hasJoin = useTextRoomStore((s) => s.hasJoin);

  useEffect(() => {
    if (janusSessionState.matches("ready") && janusSessionState.context.janus) {
      videoRoomSend({
        type: "ATTACH_PLUGIN",
        janus: janusSessionState.context.janus,
      });
    }
  }, [janusSessionState, videoRoomSend]);

  const handleRegister = (name: string) => {
    if (
      videoRoomState.matches(
        "runningPlugin.listeningMessageAndData.listeningMessage.joinRoom"
      )
    ) {
      videoRoomSend({
        type: "JOIN",
        username: name,
      });
    }
  };

  useEffect(() => {
    console.log(videoRoomState.value);
  }, [videoRoomState]);

  const renderContent = () => {
    switch (janusSessionState.value as JanusSessionState) {
      case "idle":
        return <Text>Idle</Text>;

      case "creating":
        return <Text>creating</Text>;

      case "ready":
        return <InputField inSubmit={handleRegister} placeholder="Username" />;

      case "error":
        return <Text>error</Text>;

      case "destroyed":
        return <Text>plugin destroyed</Text>;
    }
  };

  return (
    <Flex height="100vh" justify="center" align="center">
      {renderContent()}
    </Flex>
  );
};

export default VideoRoom;
