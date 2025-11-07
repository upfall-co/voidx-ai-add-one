import { useMessageStore } from "@/stores/messageStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { useEffect, useRef } from "react";

const CHAT_RESPONSE_DELAY = 1000;
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

    // 마지막 메시지가 사용자 메시지이고, 아직 처리되지 않았다면
    if (
      lastMessage &&
      lastMessage.role === "user" &&
      lastMessage.id !== lastProcessedId.current
    ) {
      // 처리된 것으로 표시
      lastProcessedId.current = lastMessage.id;

      const timer = setTimeout(() => {
        const responseContent = `"${lastMessage.content}"(이)라고 하셨네요. 
이것은 가상 봇 응답입니다. 🤖`;

        addMessage({
          role: "bot",
          content: responseContent,
          type: lastMessage.type, // 'chat' 또는 'nudge' 타입을 그대로 따름
        });
      }, CHAT_RESPONSE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [messages, addMessage]);

  // 2. 가상 넛지 팝업 트리거 시뮬레이션 (마운트 시 1회 실행)
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("[MockWebSocket] 넛지 팝업을 트리거합니다.");

      // 넛지 팝업 위치 설정 (화면 중앙)
      setPosition({
        x: window.innerWidth / 2 - 200, // 팝업 너비 400의 절반
        y: window.innerHeight / 2 - 100, // 팝업 높이 200의 절반
      });

      // 팝업 열기
      setIsOpen(true);

      // 팝업에 표시할 첫 번째 메시지 추가
      addMessage({
        role: "bot",
        content: `(시뮬레이션) 🤖
혹시 도움이 필요하신가요? 
궁금한 점을 물어보세요!`,
        type: "nudge",
      });
    }, NUDGE_TRIGGER_DELAY);

    return () => clearTimeout(timer);
  }, [addMessage, setIsOpen, setPosition]);
}
