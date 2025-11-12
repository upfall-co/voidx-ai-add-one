import type { ClientMessage } from "@/types/message";
import { create } from "zustand";

function generateUUID() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

type ClientMessageState = {
  messages: ClientMessage[];
};

type ClientMessageActions = {
  setMessages: (messages: ClientMessage[]) => void;
  addMessage: (message: Omit<ClientMessage, "id">) => void;
  removeMessage: (index: number) => void;
  clearMessages: () => void;
};

export const useMessageStore = create<
  ClientMessageState & ClientMessageActions
>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (newMessage) =>
    set((state) => ({
      messages: [...state.messages, { ...newMessage, id: generateUUID() }],
    })),
  removeMessage: (index) =>
    set((state) => ({
      messages: state.messages.filter((_, i) => i !== index),
    })),
  clearMessages: () => set({ messages: [] }),
}));
