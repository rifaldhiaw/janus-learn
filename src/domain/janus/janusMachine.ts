import { Janus } from "janus-gateway";
import { atomWithMachine } from "jotai/xstate";
import { createMachine } from "xstate";

export type JanusContext = {};

export type JanusEvent = { type: "INIT" } | { type: "SUCCEED" };

export type JanusState = "idle" | "initializing" | "ready";

const janusMachine = createMachine<JanusContext, JanusEvent>({
  key: "janus",
  initial: "idle",
  context: {},
  states: {
    idle: {
      on: {
        INIT: {
          target: "initializing",
        },
      },
    },
    initializing: {
      invoke: {
        id: "initJanus",
        src: () => (cb, _onReceive) => {
          Janus.init({
            debug: true,
            callback: () => cb({ type: "SUCCEED" }),
          });
        },
      },
      on: {
        SUCCEED: {
          target: "ready",
        },
      },
    },
    ready: {
      type: "final",
    },
  },
});

const janusAtom = atomWithMachine(() => janusMachine);

export { janusAtom };
