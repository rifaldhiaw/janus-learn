import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { assign, createMachine, Sender } from "xstate";
import { room } from "../../config";

export type JanusVideoRoomContext = {
  myId: string | undefined;
  myPrivateId: string | undefined;
  janus: Janus | undefined;
  pluginHandle: PluginHandle | undefined;
  jsep: JSEP | undefined;
};

export type JanusVideoRoomEvent =
  | { type: "ATTACH_PLUGIN"; janus: Janus }
  | { type: "ATTACH_SUCCEED"; pluginHandle: PluginHandle }
  | { type: "ATTACH_FAILED" }
  | { type: "JOIN"; username: string }
  | { type: "JOINED"; myId: string; myPrivateId: string }
  | { type: "OFFER_SUCCEED"; jsep: JSEP }
  | { type: "JSP_RECEIVED"; jsep: JSEP }
  | { type: "DATA_CHANNEL_OPENED" }
  | { type: "DATA_RECEIVED"; data: any };

const publishOwnFeed =
  (c: JanusVideoRoomContext, _e: JanusVideoRoomEvent) =>
  (callback: Sender<JanusVideoRoomEvent>) => {
    if (c.pluginHandle) {
      c.pluginHandle.createOffer({
        // Add data:true here if you want to publish datachannels as well
        media: {
          audioRecv: false,
          videoRecv: false,
          audioSend: true,
          videoSend: true,
        }, // Publishers are rendonly
        success: (jsep: any) => {
          callback({
            type: "OFFER_SUCCEED",
            jsep: jsep,
          });
        },
        error: (_error: any) => {},
      });
    }
  };

const configureMedia =
  (c: JanusVideoRoomContext, _e: JanusVideoRoomEvent) =>
  (_callback: Sender<JanusVideoRoomEvent>) => {
    if (c.pluginHandle && c.jsep) {
      var publish = { request: "configure", audio: true, video: true };
      c.pluginHandle.send({ message: publish, jsep: c.jsep });
    }
  };

const attachPlugin =
  (c: JanusVideoRoomContext, _e: JanusVideoRoomEvent) =>
  (callback: Sender<JanusVideoRoomEvent>) => {
    c.janus?.attach({
      plugin: "janus.plugin.videoroom",

      success: (pluginHandle) => {
        callback({
          type: "ATTACH_SUCCEED",
          pluginHandle: pluginHandle,
        });
      },
      error: () => {
        callback({ type: "ATTACH_FAILED" });
      },

      consentDialog: (_on) => {},
      iceState: (_state) => {},
      mediaState: (_medium, _mid, _on) => {},
      webrtcState: (_on) => {},

      onmessage: (msg: any, jsep) => {
        console.log({ msg });
        const event = msg["videoroom"];
        if (event) {
          if (event === "joined") {
            callback({
              type: "JOINED",
              myId: msg["id"],
              myPrivateId: msg["private_id"],
            });

            if (msg["publishers"]) {
              const list = msg["publishers"];
              console.log("list", list);
            }
          } else if (event === "destroyed") {
          } else if (event === "event") {
            if (msg["streams"]) {
            } else if (msg["publishers"]) {
              if (msg["publishers"]) {
                const list = msg["publishers"];
                console.log("pubs from event", list);
              }
            } else if (msg["leaving"]) {
            } else if (msg["unpublished"]) {
            } else if (msg["error"]) {
            }
          }
        }

        if (jsep) {
          c.pluginHandle?.handleRemoteJsep({ jsep: jsep });
        }
      },

      onlocaltrack: () => {},

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

const janusVideoRoomMachine = createMachine<
  JanusVideoRoomContext,
  JanusVideoRoomEvent
>({
  key: "janusVideoRoom",
  id: "janusVideoRoom",
  initial: "idle",
  context: {
    myId: undefined,
    myPrivateId: undefined,
    janus: undefined,
    pluginHandle: undefined,
    jsep: undefined,
  },
  states: {
    idle: {
      on: {
        ATTACH_PLUGIN: {
          target: "runningPlugin",
          actions: assign((_c, e) => ({
            janus: e.janus,
          })),
        },
      },
    },

    runningPlugin: {
      invoke: {
        src: attachPlugin,
      },

      initial: "attaching",
      states: {
        attaching: {
          on: {
            ATTACH_SUCCEED: {
              target: "listeningMessageAndData",
              actions: [
                assign((_c, e) => ({
                  pluginHandle: e.pluginHandle,
                })),
              ],
            },
            ATTACH_FAILED: {
              target: "attchPluginFailed",
            },
          },
        },

        attchPluginFailed: {},
        listeningMessageAndData: {
          type: "parallel",
          states: {
            listeningMessage: {
              initial: "joinRoom",
              states: {
                joinRoom: {
                  on: {
                    JOIN: {
                      target: "joining",
                      actions: (c, e) => {
                        const register = {
                          request: "join",
                          room: room,
                          ptype: "publisher",
                          display: e.username,
                        };
                        c.pluginHandle?.send({
                          message: register,
                        });
                      },
                    },
                  },
                },
                joining: {
                  on: {
                    JOINED: {
                      target: "offering",
                    },
                  },
                },
                offering: {
                  invoke: { src: publishOwnFeed },
                  on: {
                    OFFER_SUCCEED: {
                      target: "configuring",
                      actions: assign((c, e) => ({
                        jsep: e.jsep,
                      })),
                    },
                  },
                },
                configuring: {
                  invoke: { src: configureMedia },
                },
              },
            },
            listeningData: {
              on: {},
            },
          },
        },
      },
    },
  },
});

export { janusVideoRoomMachine };
