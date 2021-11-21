import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { assign, createMachine } from "xstate";

export type JanusPluginContext = {
  data: Array<any>;
  chats: Array<string>;
  janus: Janus | undefined;
  pluginType: string | undefined;
  pluginHandle: PluginHandle | undefined;
  jsep: JSEP | undefined;
};

export type JanusPluginEvent =
  | { type: "ATTACH_SUCCEED"; pluginHandle: PluginHandle }
  | { type: "ATTACH_FAILED" }
  | { type: "OFFER_RECEIVED"; jsep: JSEP }
  | { type: "DATA_CHANNEL_OPENED" }
  | { type: "DATA_RECEIVED"; data: any };

export type JanusPluginBaseState = "idle" | "running";

export type JanusPluginState =
  | "idle"
  | "attchPluginFailed"
  | "readyForSetup"
  | "setupFailed"
  | "waitingOffer"
  | "sendingAnswer"
  | "channelReady"
  | "channelError"
  | "receivingData";

const setupReq = (c: JanusPluginContext, e: JanusPluginEvent) => {
  return new Promise((res, rej) => {
    if (c.pluginHandle) {
      const body = { request: "setup" };
      c.pluginHandle.send({
        message: body,
        success: res,
        error: rej,
      });
    }
  });
};

const sendAnswerReq = (c: JanusPluginContext, e: JanusPluginEvent) => {
  return new Promise<void>((res, rej) => {
    if (c.pluginHandle && c.jsep) {
      c.pluginHandle.createAnswer({
        jsep: c.jsep,
        media: { audio: false, video: false, data: true }, // We only use datachannels
        success: (jsep: JSEP) => {
          if (c.pluginHandle && jsep) {
            const body = { request: "ack" };
            c.pluginHandle.send({
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

const janusPluginMachine = createMachine<JanusPluginContext, JanusPluginEvent>({
  key: "janus",
  initial: "idle",
  context: {
    data: [],
    chats: [],
    janus: undefined,
    pluginType: undefined,
    pluginHandle: undefined,
    jsep: undefined,
  },
  states: {
    idle: {
      on: {
        ATTACH_SUCCEED: {
          target: "readyForSetup",
          actions: assign((c, e) => ({
            pluginHandle: e.pluginHandle,
          })),
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
          actions: assign((c, e) => ({
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
          actions: assign((c, e) => ({
            chats:
              e.data.textroom == "message"
                ? [...c.chats, e.data.text]
                : c.chats,
          })),
        },
      },
    },
  },
});

export { janusPluginMachine };
