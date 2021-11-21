import type { NextPage } from "next";
import React, { useEffect, useState } from "react";
import { Box, Button, Flex, HStack, Input, Text } from "@chakra-ui/react";
import { useMachine } from "@xstate/react";
import { janusMachine, JanusState } from "../src/domain/janus/janusMachine";
import {
  JanusSessionContext,
  janusSessionMachine,
  JanusSessionState,
} from "../src/domain/janus/janusSessionMachine";
import {
  JanusPluginContext,
  janusPluginMachine,
} from "../src/domain/janus/janusPluginMachine";
import { Janus } from "janus-gateway";

const myRoom = 1234;

const Home: NextPage = () => {
  const [_janusState, janusSend] = useMachine(janusMachine);
  const [janusSessionState, janusSessionSend] = useMachine(janusSessionMachine);
  const [janusPluginState, janusPluginSend] = useMachine(janusPluginMachine);

  const [hasJoin, setHasJoin] = useState(false);

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

  const handleSendMsg = (msg: string) => {
    if (msg != "" && pluginHandle) {
      const message = {
        textroom: "message",
        transaction: Janus.randomString(12),
        room: myRoom,
        text: msg,
      };
      pluginHandle.data({
        text: JSON.stringify(message),
      });
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
          <ChatRoom
            chats={janusPluginState.context.chats}
            onSend={handleSendMsg}
          />
        ) : (
          <InputField onEnter={hanldeRegister} placeholder="Username" />
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

function ChatRoom(props: {
  onSend: (v: string) => void;
  chats: Array<string>;
}) {
  return (
    <Box>
      <Box h="200px">
        {props.chats.map((v, i) => (
          <Text key={i}>{v}</Text>
        ))}
      </Box>
      <InputField onEnter={props.onSend} placeholder="Write Message" />
    </Box>
  );
}

function InputField(props: {
  placeholder: string;
  onEnter: (v: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <HStack>
      <Input
        placeholder={props.placeholder}
        flex={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button
        onClick={() => {
          props.onEnter(value);
          setValue("");
        }}
        colorScheme="blue"
      >
        Enter
      </Button>
    </HStack>
  );
}
export default Home;
