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

  // 1. (오류 수정) 무한 루프를 방지하기 위해 각 상태를 개별적으로 구독합니다.
  const isChatbotOpen = useChatbotStore((s) => s.isOpen);
  const mode = useChatbotStore((s) => s.mode);
  const setMode = useChatbotStore((s) => s.setMode);

  const lastProcessedId = useRef<string | null>(null);

  // Effect 1: 사용자 메시지에 대한 봇 응답
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
      // 'nudge' 타입 메시지 응답 시 'chat' 타입 중복 처리 방지
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

  // Effect 2: 봇 메시지 수신 시 챗봇 "Wake up"
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];

    // 마지막 메시지가 봇의 응답이고, 챗봇이 열려있지만 자는 상태일 때
    if (
      lastMessage &&
      lastMessage.role === "bot" &&
      isChatbotOpen &&
      mode === "sleeping"
    ) {
      setMode("chatting");
    }
  }, [messages, isChatbotOpen, mode, setMode]);

  // Effect 3: 마운트 시 1회 넛지 트리거
  useEffect(() => {
    const timer = setTimeout(() => {
      // setTimeout 콜백 시점의 최신 상태를 가져오기 위해 getState() 사용
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
        console.log(
          "[MockWebSocket] 챗봇이 닫혀있어 넛지 팝업을 트리거합니다."
        );
        setPosition({
          x: window.innerWidth / 2 - 200, // 팝업 너비 400의 절반
          y: window.innerHeight / 2 - 100, // 팝업 높이 200의 절반
        });
        setIsOpen(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage, setIsOpen, setPosition]); // 마운트 시 1회만 실행
}
