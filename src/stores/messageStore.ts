import { create } from "zustand";

export type MessageType = "chat" | "nudge";
export type MessageRole = "user" | "bot";
export type ContentType = "message" | "product";

export type ClientMessage = {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  contentType?: ContentType;
};

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
    set((state) => {
      const newId = generateUUID();
      const messagesToAdd: ClientMessage[] = [{ ...newMessage, id: newId }];
      if (newMessage.type === "nudge") {
        messagesToAdd.push({
          ...newMessage,
          type: "chat",
          id: generateUUID(),
        });
      }
      return {
        messages: [...state.messages, ...messagesToAdd],
      };
    }),
  removeMessage: (index) =>
    set((state) => ({
      messages: state.messages.filter((_, i) => i !== index),
    })),
  clearMessages: () => set({ messages: [] }),
}));
