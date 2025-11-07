import { useChatbotStore } from "@/stores/chatbotStore"; // 1. 챗봇 스토어 임포트
import { useMessageStore } from "@/stores/messageStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { useEffect, useRef } from "react";

// 가상 챗봇 응답 딜레이 (ms)
const CHAT_RESPONSE_DELAY = 1000;
// 가상 넛지 팝업 트리거 딜레이 (ms)
const NUDGE_TRIGGER_DELAY = 5000;

/**
 * 가상 WebSocket 연결을 시뮬레이션하는 커스텀 훅입니다.
 * 1. 사용자가 메시지를 보낼 때마다(role: 'user') 가상 봇 응답을 생성합니다.
 * 2. 챗봇이 닫혀있으면 넛지 팝업을, 열려있으면 챗봇으로 넛지 메시지를 보냅니다.
 * 3. 챗봇이 열려있고 sleeping 모드일 때 메시지를 받으면 chatting 모드로 전환합니다.
 */
export function useMockWebSocket() {
  const { messages, addMessage } = useMessageStore();
  const { setIsOpen, setPosition } = useSmartPopupStore();

  const {
    isOpen: isChatbotOpen,
    mode,
    setMode,
  } = useChatbotStore((s) => ({
    isOpen: s.isOpen,
    mode: s.mode,
    setMode: s.setMode,
  }));

  const lastProcessedId = useRef<string | null>(null);

  // 1. 사용자 메시지에 대한 봇 응답 시뮬레이션
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    // 3. 봇 응답 로직
    if (
      lastMessage &&
      lastMessage.role === "user" &&
      lastMessage.id !== lastProcessedId.current
    ) {
      // 4. 'nudge' 타입 메시지 응답 시 'chat' 타입 중복 처리 방지
      // (messageStore가 'nudge'와 'chat'을 동시에 생성하므로, 'nudge'만 처리)
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

        // 5. 수신한 메시지 타입 그대로 응답
        // (type: 'nudge'로 응답하면 messageStore가 'chat'도 자동 생성)
        addMessage({
          role: "bot",
          content: responseContent,
          type: lastMessage.type,
        });

        // 6. 챗봇이 열려있고 'sleeping' 모드일 때 'chatting'으로 전환
        if (isChatbotOpen && mode === "sleeping") {
          setMode("chatting");
        }
      }, CHAT_RESPONSE_DELAY);

      return () => clearTimeout(timer);
    }
    // 7. 챗봇 상태 변경 시에도 effect가 재실행되도록 deps에 추가
  }, [messages, addMessage, isChatbotOpen, mode, setMode]);

  // 2. 가상 넛지 팝업 트리거 시뮬레이션 (마운트 시 1회 실행)
  useEffect(() => {
    const timer = setTimeout(() => {
      // 8. 챗봇이 열려있는지 확인 (Hook이 아닌 store의 최신 상태 사용)
      if (useChatbotStore.getState().isOpen) {
        console.log(
          "[MockWebSocket] 챗봇이 열려있어 챗봇으로 넛지를 보냅니다."
        );
        addMessage({
          role: "bot",
          content: `(시뮬레이션) 🤖
챗봇이 열려있네요! 
궁금한 점을 물어보세요!`,
          type: "chat", // 'chat' 타입으로 직접 전송
        });

        // 9. 챗봇이 열려있고 'sleeping' 모드라면 'chatting'으로 전환
        if (useChatbotStore.getState().mode === "sleeping") {
          useChatbotStore.getState().setMode("chatting");
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
          type: "nudge", // 'nudge' 타입으로 전송 (messageStore가 'chat'으로 자동 누적)
        });
      }
    }, NUDGE_TRIGGER_DELAY);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage, setIsOpen, setPosition]); // deps는 의도적으로 비워서 마운트 시 1회만 실행
}
