"use client";

import { useChatbotStore } from "@/stores/chatbotStore";
import { useInteractionStore } from "@/stores/interactionStore";
import { useMessageStore } from "@/stores/messageStore";
import { Canvas } from "@react-three/fiber"; // 2. 임포트
import {
  type KeyboardEvent,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PiPaperPlaneFill } from "react-icons/pi";
import { useSwipeable } from "react-swipeable";
import { ArkModelScene } from "./ArkModelScene";
import ChattingList from "./ChattingList";
import ChatbotToolbar from "./Toolbar";

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
    return messages.filter((msg) => msg.type === "chat");
  }, [messages]);

  const lastChatMessage = chatMessages[chatMessages.length - 1];

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (mode === "sleeping") {
        if (tutorialStep === 0) {
          setTutorialStep(1);
        }
        setMode("chatting");
      }
    },
    onSwipedRight: () => {
      if (mode === "sleeping" && tutorialStep === 0) return;
      if (mode === "chatting") {
        setMode("sleeping");
      }
    },
    delta: 10,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true,
  });

  // const handlers = useSwipeable({
  //   onSwipedLeft: () => {
  //     if (mode === "sleeping") {
  //       if (tutorialStep === 0) {
  //         setTutorialStep(1);
  //       }
  //       setMode("chatting");
  //     }
  //   },
  //   onSwipedRight: () => {
  //     if (mode === "sleeping" && tutorialStep === 0) return;
  //     if (mode === "chatting") {
  //       if (tutorialStep === 1) {
  //         setTutorialStep(2);
  //       }
  //       setMode("sleeping");
  //     }
  //   },
  //   onSwipedUp: () => {
  //     if (mode === "sleeping" && tutorialStep === 0) return;
  //     if (mode === "sleeping") {
  //       if (tutorialStep === 2) {
  //         setTutorialStep(3);
  //       }
  //       setMode("360");
  //     }
  //   },
  //   onSwipedDown: () => {
  //     if (mode === "sleeping" && tutorialStep === 0) return;
  //     if (mode === "360") {
  //       setMode("sleeping");
  //     }
  //   },
  //   delta: 10,
  //   preventScrollOnSwipe: true,
  //   trackTouch: true,
  //   trackMouse: true,
  // });

  const submitMessage = () => {
    const content = input.trim();
    if (!content) return;
    setLevel(level + 0.1);
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
            <Suspense fallback={null}>
              <Canvas
                dpr={[1, 2]}
                // camera={
                //   mode === "360"
                //     ? { fov: 20, position: [0, 0, 10] }
                //     : { fov: 6.5, position: [15, 6, 15] }
                // }
                camera={{ fov: 6.5, position: [15, 6, 15] }}
                style={{
                  touchAction: "none",
                  opacity: mode === "chatting" ? 0.3 : 1,
                }}
              >
                {/* {mode === "360" ? <View360Scene /> : <ArkModelScene />} */}
                <ArkModelScene />
              </Canvas>
            </Suspense>

            {/* {tutorialStep < 1 && (
              <GestureTutorial step={tutorialStep} isOpen={isOpen} />
            )} */}
            <ChattingList />
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
