"use client";

import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { useInteractionStore } from "@/stores/scenarioStore";
import {
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PiPaperPlaneFill } from "react-icons/pi";
import { useSwipeable } from "react-swipeable";
import ArkModel from "./ArkModel";
import ChattingList from "./ChattingList";
import GestureTutorial from "./GestureTutorual";
import ChatbotToolbar from "./Toolbar";
// import View360 from "./View360"; // 1. View360 제거

export default function Chatbot() {
  const isOpen = useChatbotStore((s) => s.isOpen);
  const arkPreview = useChatbotStore((s) => s.arkPreview);
  const mode = useChatbotStore((s) => s.mode);
  const input = useChatbotStore((s) => s.input);
  const setMode = useChatbotStore((s) => s.setMode);
  const setInput = useChatbotStore((s) => s.setInput);
  const setIsOpen = useChatbotStore((s) => s.setIsOpen);

  const messages = useMessageStore((s) => s.messages);
  const addMessage = useMessageStore((s) => s.addMessage);

  const level = useInteractionStore((s) => s.level);
  const setLevel = useInteractionStore((s) => s.setLevel);

  const [isMobile, setIsMobile] = useState(false);
  const [tutorialStep, setTutorialStep] = useState<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const chatMessages = useMemo(() => {
    // 2. 'chat' 타입만 필터링 (ChattingList.tsx에서도 하지만 이중 체크)
    return messages.filter((msg) => msg.type === "chat");
  }, [messages]);

  const lastChatMessage = chatMessages[chatMessages.length - 1];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (mode === "sleeping") {
        if (tutorialStep === 0) setTutorialStep(1);
        setMode("chatting");
      }
    },
    onSwipedRight: () => {
      if (mode === "chatting") {
        // 3. 튜토리얼 스텝 2(360)로 가는 로직 제거
        // if (tutorialStep === 1) setTutorialStep(2);
        setMode("sleeping");
      }
    },
    // 4. onSwipedUp, onSwipedDown 핸들러 제거
    delta: 10,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });

  const submitMessage = () => {
    const content = input.trim();
    if (!content) return;
    setLevel(level + 0.1);
    // 5. 'chat' 타입으로 메시지 전송
    addMessage({ role: "user", content, type: "chat" });
    setInput("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (e.nativeEvent.isComposing) return;
      if (isMobile) return;
      else {
        if (e.shiftKey) return;
        else {
          e.preventDefault();
          formRef.current?.requestSubmit();
        }
      }
    }
  };

  useEffect(() => {
    if (
      isOpen &&
      mode === "chatting" &&
      textareaRef.current &&
      lastChatMessage &&
      lastChatMessage.role === "bot"
    ) {
      textareaRef.current.focus();
    }
  }, [lastChatMessage, isOpen, mode]);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-[5vh] right-[2vw] z-1000 flex w-92 flex-col overflow-hidden rounded-2xl border border-white/35 drop-shadow-2xl bg-white/70 backdrop-blur-xl saturate-150 p-4 ">
          <ChatbotToolbar />

          <div
            {...handlers}
            className="relative h-[300px] shrink-0 touch-none cursor-grab active:cursor-grabbing"
          >
            <GestureTutorial step={tutorialStep} isOpen={isOpen} />
            <ArkModel />
            <ChattingList />
            {/* 6. View360 컴포넌트 제거 */}
            {/* <View360 /> */}
          </div>

          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="relative flex px-4 py-3 border rounded-full shrink-0 border-white/35 bg-white/75 "
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              ref={textareaRef}
              onKeyDown={handleKeyDown}
              rows={1}
              className="w-full outline-none text-sm placeholder:text-black/30 resize-none"
            />
            <button
              type="submit"
              className=" text-black/80 p-1 hover:bg-black/10 rounded-full"
              aria-label="send message"
            >
              <PiPaperPlaneFill />
            </button>
          </form>
        </div>
      )}

      {!isOpen && arkPreview && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-[6vh] right-[2vw] z-999 cursor-pointer rounded-full drop-shadow-lg w-40 hover:opacity-80 transform transition-opacity duration-300 ease-in-ou"
        >
          <img
            src={arkPreview}
            alt="Chatbot Preview"
            className="object-contain w-full h-full"
            width={900}
            height={800}
          />
        </button>
      )}
    </>
  );
}