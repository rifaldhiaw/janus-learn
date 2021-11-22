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

type JanusServiceStore = {
  janusService: JanusService;
  janusSessionService: JanusSessionService;
  janusTextRoomService: JanusTextRoomService;
};

const { Provider, useStore } = createContext<JanusServiceStore>();

function JanusProvider(props: { children: ReactNode }) {
  const janusService = useInterpret(janusMachine);
  const janusSessionService = useInterpret(janusSessionMachine);
  const janusTextRoomService = useInterpret(janusTextRoomMachine);

  return (
    <Provider
      createStore={() =>
        create(() => ({
          janusService: janusService,
          janusSessionService: janusSessionService,
          janusTextRoomService: janusTextRoomService,
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

export {
  useStore as usJanusServiceStore,
  useJanusService,
  useJanusSessionService,
  useJanusTextRoomService,
  JanusProvider,
};
