import { create } from "zustand";

type SmartPopupState = {
  isOpen: boolean;
  position: { x: number; y: number };
  opacity: number;
  isExpanded: boolean;
  inputValue: string;
  isPin: boolean;
};

type SmartPopupActions = {
  setIsOpen: (value: boolean) => void;
  setPosition: (position: { x: number; y: number }) => void;
  setOpacity: (opacity: number) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  setInputValue: (inputValue: string) => void;
  setIsPin: (isPin: boolean) => void;
};

export const useSmartPopupStore = create<SmartPopupState & SmartPopupActions>(
  (set) => ({
    isOpen: false,
    position: { x: 0, y: 0 },
    opacity: 1,
    isExpanded: false,
    inputValue: "",
    isPin: false,

    setIsOpen: (value) => set({ isOpen: value }),
    setPosition: (position) => set({ position }),
    setOpacity: (opacity) => set({ opacity }),
    setIsExpanded: (isExpanded) => set({ isExpanded }),
    setInputValue: (inputValue) => set({ inputValue }),
    setIsPin: (isPin) => set({ isPin }),
  })
);
