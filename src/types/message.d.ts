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
