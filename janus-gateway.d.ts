// source:
// https://github.com/meetecho/janus-gateway/blob/master/npm/janus.d.ts
// don't trust this type! please check before use.

declare module "janus-gateway" {
  interface Dependencies {
    adapter: any;
    newWebSocket: (server: string, protocol: string) => WebSocket;
    isArray: (array: any) => array is Array<any>;
    checkJanusExtension: () => boolean;
    httpAPICall: (url: string, options: any) => void;
  }

  type DebugLevel = "trace" | "debug" | "log" | "warn" | "error";

  interface JSEP {}

  interface InitOptions {
    debug?: boolean | "all" | Array<DebugLevel>;
    callback?: () => void;
    dependencies?: Dependencies;
  }

  interface ConstructorOptions {
    server: string | Array<string>;
    iceServers?: Array<RTCIceServer>;
    ipv6?: boolean;
    withCredentials?: boolean;
    max_poll_events?: number;
    destroyOnUnload?: boolean;
    token?: string;
    apisecret?: string;
    success?: () => void;
    error?: (error: any) => void;
    destroyed?: () => void;
  }

  enum MessageType {
    Recording = "recording",
    Starting = "starting",
    Started = "started",
    Stopped = "stopped",
    SlowLink = "slow_link",
    Preparing = "preparing",
    Refreshing = "refreshing",
  }

  interface Message {
    result?: {
      status: MessageType;
      id?: string;
      uplink?: number;
    };
    error?: Error;
  }

  interface VideoMessage {
    description: string;
    id: number;
    private_id: number;
    publishers: Array<string>;
    room: number;
    videoroom: "joined";
  }

  interface PluginOptions {
    plugin: string;
    opaqueId?: string;
    success?: (handle: PluginHandle) => void;
    error?: (error: any) => void;
    consentDialog?: (on: boolean) => void;
    webrtcState?: (isConnected: boolean, reason?: string) => void;
    iceState?: (state: "connected" | "failed") => void;
    mediaState?: (
      medium: "audio" | "video",
      receiving: boolean,
      mid?: number
    ) => void;
    slowLink?: (isUplink: boolean, packetLoss: number) => void;
    onmessage?: (message: Message, jsep?: JSEP) => void;
    onlocalstream?: (stream: MediaStream) => void;
    onremotestream?: (stream: MediaStream) => void;
    onlocaltrack?: (track: any, on: boolean) => void;
    ondataopen?: (data: string) => void;
    ondata?: (data: string) => void;
    oncleanup?: () => void;
    detached?: () => void;
  }

  interface OfferParams {
    media?: {
      audioSend?: boolean;
      audioRecv?: boolean;
      videoSend?: boolean;
      videoRecv?: boolean;
      audio?: boolean | { deviceId: string };
      video?:
        | boolean
        | { deviceId: string }
        | "lowres"
        | "lowres-16:9"
        | "stdres"
        | "stdres-16:9"
        | "hires"
        | "hires-16:9";
      data?: boolean;
      failIfNoAudio?: boolean;
      failIfNoVideo?: boolean;
      screenshareFrameRate?: number;
    };
    trickle?: boolean;
    stream?: MediaStream;
    success: () => void;
    error: (error: any) => void;
  }

  interface PluginMessage {
    message: {
      request?: string;
      [otherProps: string]: any;
    };
    jsep?: JSEP;
  }

  interface PluginHandle {
    getId(): string;
    getPlugin(): string;
    send(
      message: PluginMessage & {
        success?: (result: any) => void;
        error?: (reason: any) => void;
      }
    ): void;
    createOffer(params: any): void;
    createAnswer(params: any): void;
    handleRemoteJsep(params: {
      jsep: JSEP;
      error?: (err: Error) => void;
    }): void;
    dtmf(params: any): void;
    data(params: any): void;
    isVideoMuted(): boolean;
    muteVideo(): void;
    unmuteVideo(): void;
    muteAudio(): void;
    unmuteAudio(): void;
    getBitrate(): number;
    hangup(sendRequest?: boolean): void;
    detach(params: any): void;
    webrtcStuff: {
      pc: RTCPeerConnection;
    };
  }

  class Janus {
    static useDefaultDependencies(deps: Partial<Dependencies>): Dependencies;
    static useOldDependencies(deps: Partial<Dependencies>): Dependencies;
    static init(options: InitOptions): void;
    static isWebrtcSupported(): boolean;
    static debug(...args: Array<any>): void;
    static log(...args: Array<any>): void;
    static warn(...args: Array<any>): void;
    static error(...args: Array<any>): void;
    static randomString(length: number): string;
    static attachMediaStream(
      element: HTMLMediaElement,
      stream: MediaStream
    ): void;
    static reattachMediaStream(
      to: HTMLMediaElement,
      from: HTMLMediaElement
    ): void;
    static webRTCAdapter: any;
    static safariVp8: any;

    constructor(options: ConstructorOptions);

    getServer(): string;
    isConnected(): boolean;
    getSessionId(): string;
    attach(options: PluginOptions): void;
    destroy(options: { unload: boolean }): void;
  }
}
