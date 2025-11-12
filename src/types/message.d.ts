export type MessageType = "chat" | "nudge";
export type MessageRole = "user" | "bot";

export type ClientMessage = {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
};
