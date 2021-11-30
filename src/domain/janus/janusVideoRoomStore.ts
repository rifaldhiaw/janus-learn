import { PluginHandle } from "janus-gateway";
import create from "zustand";

type VideoRoomStore = {
  myVideoHandle: PluginHandle | undefined;
  removeVideoHandle: PluginHandle | undefined;
};

const useVideoRoomStore = create<VideoRoomStore>((_set, _get) => ({
  myVideoHandle: undefined,
  removeVideoHandle: undefined,
}));

export { useVideoRoomStore };
