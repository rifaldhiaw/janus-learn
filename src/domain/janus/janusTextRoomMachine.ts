import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { assign, createMachine, Sender } from "xstate";
import create from "zustand";
import { room } from "../../config";

export type JanusTextRoomContext = {
  janus: Janus | undefined;
  textRoom: PluginHandle | undefined;
  jsep: JSEP | undefined;
};

export type JanusTextRoomEvent =
  | { type: "ATTACH_PLUGIN"; janus: Janus }
  | { type: "ATTACH_SUCCEED"; pluginHandle: PluginHandle }
  | { type: "ATTACH_FAILED" }
  | { type: "OFFER_RECEIVED"; jsep: JSEP }
  | { type: "DATA_CHANNEL_OPENED" }
  | { type: "DATA_RECEIVED"; data: any };

export type JanusTextRoomState =
  | "idle"
  | "runningTextRoomPlugin"
  | "attaching"
  | "attchPluginFailed"
  | "readyForSetup"
  | "setupFailed"
  | "waitingOffer"
  | "sendingAnswer"
  | "channelReady"
  | "channelError"
  | "receivingData";

type TextRoomStore = {
  chat: Array<string>;
  textRoom: PluginHandle | undefined;
  hasJoin: boolean;
  sendMsg: (message: string) => void;
  joinRoom: (userName: string) => void;
};

const useTextRoomStore = create<TextRoomStore>((set, get) => ({
  chat: [],
  textRoom: undefined,
  hasJoin: false,
  sendMsg: (msg) => {
    const textRoom = get().textRoom;
    const message = {
      textroom: "message",
      transaction: Janus.randomString(12),
      room: room,
      text: msg,
    };
    textRoom?.data({
      text: JSON.stringify(message),
    });
  },
  joinRoom: (userName) => {
    const textRoom = get().textRoom;
    var transaction = Janus.randomString(12);
    var register = {
      textroom: "join",
      transaction: transaction,
      room: room,
      username: Janus.randomString(12),
      display: userName,
    };
    textRoom?.data({
      text: JSON.stringify(register),
    });
    set({ hasJoin: true });
  },
}));

const setupReq = (c: JanusTextRoomContext, _e: JanusTextRoomEvent) => {
  return new Promise((res, rej) => {
    if (c.textRoom) {
      const body = { request: "setup" };
      c.textRoom.send({
        message: body,
        success: res,
        error: rej,
      });
    }
  });
};

const sendAnswerReq = (c: JanusTextRoomContext, _e: JanusTextRoomEvent) => {
  return new Promise<void>((res, rej) => {
    if (c.textRoom && c.jsep) {
      c.textRoom.createAnswer({
        jsep: c.jsep,
        media: { audio: false, video: false, data: true }, // We only use datachannels
        success: (jsep: JSEP) => {
          if (c.textRoom && jsep) {
            const body = { request: "ack" };
            c.textRoom.send({
              message: body,
              jsep: jsep,
              success: res,
              error: rej,
            });
          }
        },
        error: rej,
      });
    } else {
      rej();
    }
  });
};

const initTextRoom =
  (c: JanusTextRoomContext, _e: JanusTextRoomEvent) =>
  (callback: Sender<JanusTextRoomEvent>) => {
    c.janus?.attach({
      plugin: "janus.plugin.textroom",
      success: (pluginHandle) => {
        callback({
          type: "ATTACH_SUCCEED",
          pluginHandle: pluginHandle,
        });
      },
      error: () => {
        callback({ type: "ATTACH_FAILED" });
      },
      onmessage: (_msg, jsep) => {
        if (jsep) {
          callback({ type: "OFFER_RECEIVED", jsep: jsep });
        }
      },
      ondataopen: () => {
        callback({ type: "DATA_CHANNEL_OPENED" });
      },
      ondata: (data) => {
        var json = JSON.parse(data);
        console.log(json);
        callback({
          type: "DATA_RECEIVED",
          data: json,
        });
      },
    });
  };

const janusTextRoomMachine = createMachine<
  JanusTextRoomContext,
  JanusTextRoomEvent
>({
  key: "janusTextRoom",
  id: "janusTextRoom",
  initial: "idle",
  context: {
    janus: undefined,
    textRoom: undefined,
    jsep: undefined,
  },
  states: {
    idle: {
      on: {
        ATTACH_PLUGIN: {
          target: "runningTextRoomPlugin",
          actions: assign((_c, e) => ({
            janus: e.janus,
          })),
        },
      },
    },

    runningTextRoomPlugin: {
      invoke: {
        src: initTextRoom,
      },

      initial: "attaching",
      states: {
        attaching: {
          on: {
            ATTACH_SUCCEED: {
              target: "readyForSetup",
              actions: [
                assign((_c, e) => ({
                  textRoom: e.pluginHandle,
                })),
                (_c, e) => {
                  useTextRoomStore.setState({ textRoom: e.pluginHandle });
                },
              ],
            },
            ATTACH_FAILED: {
              target: "attchPluginFailed",
            },
          },
        },

        attchPluginFailed: {},
        readyForSetup: {
          invoke: {
            src: setupReq,
            onDone: {
              target: "waitingOffer",
            },
            onError: {
              target: "setupFailed",
            },
          },
        },

        setupFailed: {},
        waitingOffer: {
          on: {
            OFFER_RECEIVED: {
              target: "sendingAnswer",
              actions: assign((_c, e) => ({
                jsep: e.jsep,
              })),
            },
          },
        },

        sendingAnswer: {
          invoke: {
            src: sendAnswerReq,
            onDone: {
              target: "channelReady",
            },
            onError: {
              target: "channelError",
            },
          },
        },

        channelError: {},
        channelReady: {
          on: {
            DATA_CHANNEL_OPENED: {
              target: "receivingData",
            },
          },
        },

        receivingData: {
          on: {
            DATA_RECEIVED: {
              actions: (_c, e) => {
                if (e.data.textroom == "message") {
                  const curChat = useTextRoomStore.getState().chat;
                  const newChat = [...curChat, e.data.text];
                  useTextRoomStore.setState({ chat: newChat });
                }
              },
            },
          },
        },
      },
    },
  },
});

export { janusTextRoomMachine, useTextRoomStore };
