import { useEffect } from "react";
import {
  useJanusService,
  useJanusSessionService,
} from "./domain/janus/janusProvider";

function useJanusInit() {
  const [janusState, janusSend] = useJanusService();
  useEffect(() => {
    if (janusState.matches("idle")) {
      janusSend({ type: "INIT" });
    }
  }, [janusSend, janusState]);

  const [janusSessionState, janusSessionSend] = useJanusSessionService();
  useEffect(() => {
    if (janusState.matches("ready") && janusSessionState.matches("idle")) {
      janusSessionSend({ type: "CREATE" });
    }
  }, [janusSessionSend, janusSessionState, janusState]);
}

export { useJanusInit };
