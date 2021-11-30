import { useActor, useInterpret } from "@xstate/react";
import { ReactNode } from "react";
import createContext from "zustand/context";
import create from "zustand";
import { JanusContext, JanusEvent, janusMachine } from "./janusMachine";
import {
  JanusSessionContext,
  JanusSessionEvent,
  janusSessionMachine,
} from "./janusSessionMachine";
import {
  JanusTextRoomContext,
  JanusTextRoomEvent,
  janusTextRoomMachine,
} from "./janusTextRoomMachine";
import { Interpreter } from "xstate";
import {
  JanusVideoRoomContext,
  JanusVideoRoomEvent,
  janusVideoRoomMachine,
} from "./janusVideoRoomMachine";

type JanusService = Interpreter<
  JanusContext,
  any,
  JanusEvent,
  {
    value: any;
    context: JanusContext;
  }
>;

type JanusSessionService = Interpreter<
  JanusSessionContext,
  any,
  JanusSessionEvent,
  {
    value: any;
    context: JanusSessionContext;
  }
>;

type JanusTextRoomService = Interpreter<
  JanusTextRoomContext,
  any,
  JanusTextRoomEvent,
  {
    value: any;
    context: JanusTextRoomContext;
  }
>;

type JanusVideoRoomService = Interpreter<
  JanusVideoRoomContext,
  any,
  JanusVideoRoomEvent,
  {
    value: any;
    context: JanusVideoRoomContext;
  }
>;

type JanusServiceStore = {
  janusService: JanusService;
  janusSessionService: JanusSessionService;
  janusTextRoomService: JanusTextRoomService;
  janusVideoRoomService: JanusVideoRoomService;
};

const { Provider, useStore } = createContext<JanusServiceStore>();

function JanusProvider(props: { children: ReactNode }) {
  const janusService = useInterpret(janusMachine);
  const janusSessionService = useInterpret(janusSessionMachine);
  const janusTextRoomService = useInterpret(janusTextRoomMachine);
  const janusVideoRoomService = useInterpret(janusVideoRoomMachine);

  return (
    <Provider
      createStore={() =>
        create(() => ({
          janusService: janusService,
          janusSessionService: janusSessionService,
          janusTextRoomService: janusTextRoomService,
          janusVideoRoomService: janusVideoRoomService,
        }))
      }
    >
      {props.children}
    </Provider>
  );
}

function useJanusService() {
  const s = useStore((s) => s.janusService);
  return useActor(s);
}

function useJanusSessionService() {
  const s = useStore((s) => s.janusSessionService);
  return useActor(s);
}

function useJanusTextRoomService() {
  const s = useStore((s) => s.janusTextRoomService);
  return useActor(s);
}

function useJanusVideoRoomService() {
  const s = useStore((s) => s.janusVideoRoomService);
  return useActor(s);
}

export {
  useStore as usJanusServiceStore,
  useJanusService,
  useJanusSessionService,
  useJanusTextRoomService,
  useJanusVideoRoomService,
  JanusProvider,
};
