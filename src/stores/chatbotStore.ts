import { cdnUrl } from "@/constant/common";
import { create } from "zustand";

type ChatbotMode = "chatting" | "sleeping" | "360";

type ChatbotState = {
  isOpen: boolean;
  opacity: number;
  arkPreview: string;
  arkGlb: string;
  mode: ChatbotMode;
  input: string;
};

type ChatbotActions = {
  setIsOpen: (value: boolean) => void;
  setOpacity: (value: number) => void;
  setArkPreview: (url: string) => void;
  setArkGlb: (url: string) => void;
  setMode: (mode: ChatbotMode) => void;
  setInput: (input: string) => void;
};

export const useChatbotStore = create<ChatbotState & ChatbotActions>((set) => ({
  isOpen: false,
  opacity: 1,
  arkPreview: `${cdnUrl}/icons/3d_1button-icon-SVG.svg`,
  arkGlb: `${cdnUrl}/3d/ark_model_00.glb`,
  mode: "sleeping",
  input: "",

  setIsOpen: (value) => set({ isOpen: value }),
  setOpacity: (value) => set({ opacity: value }),
  setArkPreview: (url) => set({ arkPreview: url }),
  setArkGlb: (url) => set({ arkGlb: url }),
  setMode: (mode) => set({ mode }),
  setInput: (input) => set({ input }),
}));
