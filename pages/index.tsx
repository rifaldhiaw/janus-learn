import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { janusAtom } from "../src/domain/janus/janusMachine";
import {
  janusSessionAtom,
  JanusSessionContext,
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

const myRoom = 1234;

const Home: NextPage = () => {
  const [janusState, janusSend] = useAtom(janusAtom);
  const [janusSessionState, janusSessionSend] = useAtom(janusSessionAtom);
  const [janusPluginState, janusPluginSend] = useAtom(janusPluginAtom);

  const [hasJoin, setHasJoin] = useState(false);

  useEffect(() => {
    console.log(janusState.value);
  }, [janusState.value]);

  // Init janus
  useEffect(() => {
    janusSend({ type: "INIT" });
  }, [janusSend]);

  // Register text plugin
  const { janus } = janusSessionState.context as JanusSessionContext;
  useEffect(() => {
    if (janusSessionState.value === "ready" && janus) {
      janus.attach({
        plugin: "janus.plugin.textroom",
        success: (pluginHandle) => {
          janusPluginSend({
            type: "ATTACH_SUCCEED",
            pluginHandle: pluginHandle,
          });
        },
        error: () => {
          janusPluginSend({ type: "ATTACH_FAILED" });
        },
        onmessage: (_msg, jsep) => {
          if (jsep) {
            janusPluginSend({ type: "OFFER_RECEIVED", jsep: jsep });
          }
        },
        ondataopen: () => {
          janusPluginSend({ type: "DATA_CHANNEL_OPENED" });
        },
        ondata: (data) => {
          var json = JSON.parse(data);
          console.log(json);
          janusPluginSend({
            type: "DATA_RECEIVED",
            data: json,
          });
        },
      });
    }
  }, [janusSessionState.value, janusPluginSend, janus]);

  // Register user
  const { pluginHandle } = janusPluginState.context as JanusPluginContext;

  const hanldeRegister = (name: string) => {
    var transaction = Janus.randomString(12);
    var register = {
      textroom: "join",
      transaction: transaction,
      room: myRoom,
      username: Janus.randomString(12),
      display: name,
    };

    if (janusPluginState.value === "receivingData" && pluginHandle) {
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
