import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { useEffect, useRef } from "react";

// 가상 챗봇 응답 딜레이 (ms)
const CHAT_RESPONSE_DELAY = 1000;
// 가상 넛지 팝업 트리거 딜레이 (ms)
const NUDGE_TRIGGER_DELAY = 5000;

export function useMockWebSocket() {
  const { messages, addMessage } = useMessageStore();
  const { setIsOpen, setPosition } = useSmartPopupStore();

  const lastProcessedId = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage &&
      lastMessage.role === "user" &&
      lastMessage.id !== lastProcessedId.current
    ) {
      if (
        lastMessage.type === "chat" &&
        messages.find(
          (m) =>
            m.type === "nudge" &&
            m.role === "user" &&
            m.content === lastMessage.content
        )
      ) {
        lastProcessedId.current = lastMessage.id;
        return;
      }

      lastProcessedId.current = lastMessage.id;

      const timer = setTimeout(() => {
        const responseContent = `"${lastMessage.content}"(이)라고 하셨네요. 
이것은 가상 봇 응답입니다. 🤖`;

        addMessage({
          role: "bot",
          content: responseContent,
          type: lastMessage.type,
        });
      }, CHAT_RESPONSE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [messages, addMessage]);

  // Effect 3: 마운트 시 1회 넛지 트리거
  useEffect(() => {
    const timer = setTimeout(() => {
      const { isOpen, mode, setMode } = useChatbotStore.getState();

      if (isOpen) {
        console.log(
          "[MockWebSocket] 챗봇이 열려있어 챗봇으로 넛지를 보냅니다."
        );
        addMessage({
          role: "bot",
          content: `(시뮬레이션) 🤖
챗봇이 열려있네요! 
궁금한 점을 물어보세요!`,
          type: "chat",
        });

        if (mode === "sleeping") {
          setMode("chatting");
        }
      } else {
        setPosition({
          x: window.innerWidth / 2 - 200, // 팝업 너비 400의 절반
          y: window.innerHeight / 2 - 100, // 팝업 높이 200의 절반
        });
        addMessage({
          role: "bot",
          content: `(시뮬레이션) 🤖
혹시 도움이 필요하신가요? 
궁금한 점을 물어보세요!`,
          type: "nudge",
        });
      }
    }, NUDGE_TRIGGER_DELAY);

    return () => clearTimeout(timer);
  }, [addMessage, setIsOpen, setPosition]); // 마운트 시 1회만 실행
}
