import { Janus } from "janus-gateway";
import { atomWithMachine } from "jotai/xstate";
import { assign, createMachine } from "xstate";

export type JanusSessionContext = {
  server: string;
  janus: Janus | undefined;
};

export type JanusSessionEvent =
  | { type: "CREATE"; server?: string }
  | { type: "RETRY"; server?: string }
  | { type: "SUCCEED"; janus: Janus }
  | { type: "FAILED" }
  | { type: "DESTROYED" };

export type JanusSessionState =
  | "idle"
  | "creating"
  | "ready"
  | "error"
  | "destroyed";

const janusSessionMachine = createMachine<
  JanusSessionContext,
  JanusSessionEvent
>({
  key: "janusSession",
  initial: "idle",
  context: {
    server: "wss://janus.conf.meetecho.com/ws",
    janus: undefined,
  },
  states: {
    idle: {
      on: {
        CREATE: {
          target: "creating",
          actions: assign((c, e) => ({
            server: e.server ?? c.server,
          })),
        },
      },
    },
    creating: {
      invoke: {
        src: (c, e) => (callback, _onReceive) => {
          const janus: Janus = new Janus({
            server: c.server,
            success: () => callback({ type: "SUCCEED", janus: janus }),
            error: () => callback({ type: "FAILED" }),
            destroyed: () => callback({ type: "DESTROYED" }),
          });
        },
      },
      on: {
        SUCCEED: {
          target: "ready",
          actions: assign((_c, e) => ({
            janus: e.janus,
          })),
        },
        FAILED: {
          target: "error",
        },
      },
    },
    ready: {
      on: {
        DESTROYED: {
          target: "destroyed",
        },
      },
    },
    error: {
      on: {
        RETRY: {
          target: "creating",
          actions: assign((c, e) => ({
            server: e.server ?? c.server,
          })),
        },
      },
    },
    destroyed: {
      type: "final",
    },
  },
});

const janusSessionAtom = atomWithMachine(() => janusSessionMachine);

export { janusSessionAtom };
