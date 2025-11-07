import { create } from "zustand";

type SmartPopupState = {
  isOpen: boolean;
  content: string;
  position: { x: number; y: number };
};

type SmartPopupActions = {
  setIsOpen: (value: boolean) => void;
  setContent: (content: string) => void;
  setPosition: (position: { x: number; y: number }) => void;
};

export const useSmartPopupStore = create<SmartPopupState & SmartPopupActions>(
  (set) => ({
    isOpen: false,
    content: "",
    position: { x: 0, y: 0 },

    setIsOpen: (value) => set({ isOpen: value }),
    setContent: (content) => set({ content }),
    setPosition: (position) => set({ position }),
  })
);
