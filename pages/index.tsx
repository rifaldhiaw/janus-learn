import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { janusAtom } from "../src/domain/janus/janusMachine";
import {
  janusSessionAtom,
  JanusSessionState,
} from "../src/domain/janus/janusSessionMachine";
import {
  janusPluginAtom,
  JanusPluginContext,
} from "../src/domain/janus/janusPluginMachine";
import { Janus } from "janus-gateway";
import { useAtom } from "jotai";
import ChatRoom from "../src/ui/textRoom/ChatRoom";
import InputField from "../src/components/InputField";
import { room } from "../src/config";

const Home: NextPage = () => {
  const [_janusState, janusSend] = useAtom(janusAtom);
  const [janusSessionState, janusSessionSend] = useAtom(janusSessionAtom);
  const [janusPluginState, janusPluginSend] = useAtom(janusPluginAtom);

  const [hasJoin, setHasJoin] = useState(false);

  // useEffect(() => {
  //   console.log(janusPluginState.value);
  // }, [janusPluginState.value]);

  // Init janus
  useEffect(() => {
    janusSend({ type: "INIT" });
  }, [janusSend]);

  // Init plugin machine
  useEffect(() => {
    if (janusSessionState.matches("ready") && janusSessionState.context.janus) {
      janusPluginSend({
        type: "INIT",
        janus: janusSessionState.context.janus,
      });
    }
  }, [janusSessionState, janusPluginSend]);

  // Register text room plugin
  useEffect(() => {
    if (janusPluginState.matches("ready")) {
      janusPluginSend({
        type: "ATTACH_TEXTROOM_PLUGIN",
      });
    }
  }, [janusPluginState, janusPluginSend]);

  // Register user
  const { pluginHandle } = janusPluginState.context as JanusPluginContext;
  const hanldeRegister = (name: string) => {
    var transaction = Janus.randomString(12);
    var register = {
      textroom: "join",
      transaction: transaction,
      room: room,
      username: Janus.randomString(12),
      display: name,
    };

    if (
      janusPluginState.matches("runningTextRoomPlugin.receivingData") &&
      pluginHandle
    ) {
      pluginHandle.data({
        text: JSON.stringify(register),
      });
      setHasJoin(true);
    }
  };

  const renderContent = () => {
    switch (janusSessionState.value as JanusSessionState) {
      case "idle":
        return (
          <Button onClick={() => janusSessionSend({ type: "CREATE" })}>
            Create Session
          </Button>
        );
      case "creating":
        return <Text>creating</Text>;

      case "ready":
        return hasJoin ? (
          <ChatRoom />
        ) : (
          <InputField inSubmit={hanldeRegister} placeholder="Username" />
        );

      case "error":
        return <Text>ready</Text>;

      case "destroyed":
        return <Text>ready</Text>;
    }
  };

  return (
    <Flex height="100vh" justify="center" align="center">
      <Box>{renderContent()}</Box>
    </Flex>
  );
};

export default Home;
