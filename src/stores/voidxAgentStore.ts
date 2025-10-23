import { cdnIconUrl, cdnUrl } from "@/constant/common";
import { create } from "zustand";

export type MessageType = "chat" | "nudge";
export type MessageRole = "user" | "bot";

export type VoidxAgentMessage = {
  id: string;
  role: MessageRole;
  content: string;
  type: MessageType;
  quickButtons?: {
    label: string;
    onClick: () => void;
  }[];
};

type VoidxAgentState = {
  isVisible: boolean;
  isSleeping: boolean;
  chatOpen: boolean;
  agentUrl: string;
  backgroundUrl: string | null;
  chatbotButtonUrl: string;
  messages: VoidxAgentMessage[];
  level: number;
  donutProgress: number;
  currentScenarioId: string;
};

type VoidxAgentActions = {
  setIsVisible: (value: boolean) => void;
  setIsSleeping: (value: boolean) => void;
  setChatOpen: (value: boolean) => void;
  setAgentUrl: (url: string) => void;
  setBackgroundUrl: (url: string | null) => void;
  setChatbotButtonUrl: (url: string) => void;
  setLevel: (level: number | ((prevLevel: number) => number)) => void;
  setMessages: (messages: VoidxAgentMessage[]) => void;
  addMessage: (message: Omit<VoidxAgentMessage, "id">) => void;
  removeMessage: (index: number) => void;
  clearMessagesByType: (type: MessageType) => void;
  archiveMessages: (messagesToArchive: VoidxAgentMessage[]) => void;
  clearMessages: () => void;
  setDonutProgress: (
    progress: number | ((prevProgress: number) => number)
  ) => void;
  setCurrentScenarioId: (id: string) => void;
};

function generateUUID() {
  // crypto.randomUUID가 사용 가능하면 최신 기능을 사용
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // 사용 불가능할 경우를 위한 간단한 대체 로직
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const useVoidxAgentStore = create<VoidxAgentState & VoidxAgentActions>(
  (set, get) => ({
    isVisible: false,
    setIsVisible: (value) => set({ isVisible: value }),
    chatOpen: false,
    setChatOpen: (value) => set({ chatOpen: value }),
    nudgeOpen: false,
    isSleeping: false,
    setIsSleeping: (value) => set({ isSleeping: value }),
    backgroundUrl: null,
    setBackgroundUrl: (url) => set({ backgroundUrl: url }),
    chatbotButtonUrl: cdnIconUrl("chatbot_float_btn"),
    setChatbotButtonUrl: (url) => set({ chatbotButtonUrl: url }),
    agentUrl: `${cdnUrl}/3d/character-default.glb`,
    setAgentUrl: (url) => set({ agentUrl: url }),
    currentScenarioId: "start",
    setCurrentScenarioId: (id) => set({ currentScenarioId: id }),
    messages: [],
    setMessages: (messages) => set({ messages }),
    clearMessages: () => set({ messages: [] }),
    addMessage: (newMessage) =>
      set((state) => ({
        messages: [...state.messages, { ...newMessage, id: generateUUID() }],
      })),
    removeMessage: (index) =>
      set((state) => ({
        messages: state.messages.filter((_, i) => i !== index),
      })),
    clearMessagesByType: (type) =>
      set((state) => ({
        messages: state.messages.map((msg) => ({
          ...msg,
          type: type === "chat" ? "nudge" : "chat",
        })),
      })),
    archiveMessages: () =>
      set((state) => {
        const messagesToArchive = state.messages.filter(
          (msg) => msg.type === "nudge"
        );
        if (messagesToArchive.length === 0) {
          return {}; // 보관할 메시지가 없으면 상태 변경 없음
        }

        const convertedMessages = messagesToArchive.map((msg) => ({
          ...msg,
          type: "chat" as MessageType,
        }));

        const remainingMessages = state.messages.filter(
          (msg) => msg.type !== "nudge"
        );

        return { messages: [...remainingMessages, ...convertedMessages] };
      }),
    level: 1,
    setLevel: (newLevel) =>
      set((state) => {
        const maxLevel = 5;
        // 1. 함수형 업데이트와 직접 값 할당을 모두 처리하여 '될 뻔한' 레벨 계산
        const potentialNewLevel =
          typeof newLevel === "function" ? newLevel(state.level) : newLevel;

        // 2. 현재 레벨이 최대 레벨 이상이면 더 이상 올리지 않음
        if (state.level >= maxLevel) {
          return { level: maxLevel };
        }

        // 3. 레벨업이 일어나는지 판별
        const currentLevelInt = Math.floor(state.level);
        const newLevelInt = Math.floor(potentialNewLevel);

        let finalLevel;

        if (newLevelInt > currentLevelInt) {
          // 4-1. 레벨업이 발생했다면, 새로운 레벨의 정수값을 할당
          finalLevel = newLevelInt;
        } else {
          // 4-2. 레벨업이 아니라면, 소수점을 포함한 값을 그대로 할당
          finalLevel = potentialNewLevel;
        }

        // 5. 계산된 최종 레벨이 최대 레벨을 넘지 않도록 마지막으로 한번 더 제한
        return { level: Math.min(finalLevel, maxLevel) };
      }),
    donutProgress: 0,
    setDonutProgress: (progress) => {
      const newProgress =
        typeof progress === "function"
          ? progress(get().donutProgress)
          : progress;
      set({
        donutProgress: newProgress,
      });
    },
  })
);
