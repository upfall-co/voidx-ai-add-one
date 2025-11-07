import { create } from "zustand";

type AgentState = {
  preview: string;
  glb: string;
  asleep: boolean;
};

type AgentActions = {
  setPreview: (url: string) => void;
  setGlb: (url: string) => void;
  setAsleep: (value: boolean) => void;
};

export const useAgentStore = create<AgentState & AgentActions>((set) => ({
  preview: "",
  glb: "",
  asleep: false,

  setPreview: (url) => set({ preview: url }),
  setGlb: (url) => set({ glb: url }),
  setAsleep: (value) => set({ asleep: value }),
}));
