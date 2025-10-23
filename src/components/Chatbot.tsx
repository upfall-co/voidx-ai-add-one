import { cdnIconUrl } from "@/constant/common";
import {
  useAgentAnimations,
  type AgentAnimation,
} from "@/hooks/useAgentAnimations";
import useDraggable from "@/hooks/useDraggable";
import { useVoidxAgentStore } from "@/stores/voidxAgentStore";
import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { Group, type Object3DEventMap } from "three";
import MessageBubble from "./MessageBubble";
import TestRoom from "./TestRoom";

import { BiSolidSun } from "react-icons/bi";
import { FaChevronDown, FaMoon } from "react-icons/fa";
const sendIcon = cdnIconUrl("icon-chatbot-send");

export default function Chatbot() {
  const [inputValue, setInputValue] = useState("");
  const [pinned, setPinned] = useState(false);
  const [opacity, setOpacity] = useState(1);

  const messages = useVoidxAgentStore((s) => s.messages),
    chatOpen = useVoidxAgentStore((s) => s.chatOpen),
    setChatOpen = useVoidxAgentStore((s) => s.setChatOpen),
    isSleeping = useVoidxAgentStore((s) => s.isSleeping),
    setIsSleeping = useVoidxAgentStore((s) => s.setIsSleeping),
    chatbotButtonUrl = useVoidxAgentStore((s) => s.chatbotButtonUrl);
  const addMessage = useVoidxAgentStore((s) => s.addMessage),
    level = useVoidxAgentStore((s) => s.level),
    setLevel = useVoidxAgentStore((s) => s.setLevel);

  const containerRef = useRef<HTMLDivElement>(null);
  const chattingBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chattingBodyRef.current) {
      chattingBodyRef.current.scrollTop = chattingBodyRef.current.scrollHeight;
    }
  }, [messages, chatOpen]);

  !containerRef && useDraggable(containerRef, pinned);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content) return;

    setLevel(level + 0.1);
    addMessage({ role: "user", content, type: "chat" });
    setInputValue("");
  };

  return (
    <>
      {chatOpen && (
        <div
          ref={containerRef}
          className="fixed bottom-[5vh] right-[2vw] z-1000 flex w-92 flex-col overflow-hidden rounded-2xl border border-white/35 drop-shadow-2xl bg-white/70 backdrop-blur-xl saturate-150"
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-white/50 text-black/60">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="
    w-20 h-6 cursor-pointer appearance-none bg-transparent
    [&::-webkit-slider-runnable-track]:h-1
    [&::-webkit-slider-runnable-track]:rounded-full
    [&::-webkit-slider-runnable-track]:bg-gray-300
    [&::-webkit-slider-runnable-track]:shadow-inner
    [&::-webkit-slider-thumb]:h-3
    [&::-webkit-slider-thumb]:w-3
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-gray-700
    [&::-webkit-slider-thumb]:shadow
    [&::-webkit-slider-thumb]:-mt-1
  "
            />
            <div className="flex items-center gap-1 text-black/30">
              <button
                className="p-2 rounded-md hover:bg-black/10"
                onClick={() => setIsSleeping(!isSleeping)}
              >
                {isSleeping ? (
                  <FaMoon className="w-4 h-4" />
                ) : (
                  <BiSolidSun className="w-4 h-4" />
                )}
              </button>
              <button
                className="p-2 rounded-md hover:bg-black/10"
                onClick={() => setChatOpen(false)}
              >
                <FaChevronDown className="w-4 h-4" />
              </button>
            </div>
          </header>

          <div className="relative h-[300px] shrink-0">
            <TestRoom />
            <div
              ref={chattingBodyRef}
              className="absolute top-0 w-full h-full mb-24"
            >
              <div
                className="flex flex-col h-full gap-3 p-4 overflow-y-auto"
                style={{ opacity }}
              >
                <MessageBubble role="bot">안녕하세요</MessageBubble>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} role={msg.role}>
                    {msg.content}
                  </MessageBubble>
                ))}
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="relative flex px-4 py-3 mx-4 my-4 border rounded-full -4 shrink-0 border-white/35 bg-white/75 "
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="adsf"
              className="w-full text-[15px] outline-none placeholder:font-medium placeholder:text-black/30 backdrop-blur-xl saturate-150"
            />
            <button type="submit" className="right-4 bg-none">
              <img src={sendIcon} alt="send" className="w-5 h-" />
            </button>
          </form>
        </div>
      )}

      {!chatOpen && chatbotButtonUrl && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-[6vh] right-[2vw] z-999 cursor-pointer h-16 w-16 animate-pulse rounded-full bg-white p-0 drop-shadow-lg hover:animate-none"
          style={{ animation: "rotate-slow 15s linear infinite" }}
        >
          <img
            src={chatbotButtonUrl}
            alt="Chatbot"
            className="object-contain w-full h-full"
          />
        </button>
      )}
    </>
  );
}

function useClone(scene: Group<Object3DEventMap>) {
  return useMemo(() => scene.clone(true) as Group<Object3DEventMap>, [scene]);
}

function SleepAgent({
  modelPath,
  onInteract,
}: {
  modelPath: string;
  onInteract: (state: AgentAnimation) => void;
}) {
  const ref = useRef<Group>(null!);
  const { scene } = useGLTF(modelPath);
  const clonedScene = useClone(scene);
  const setLevel = useVoidxAgentStore((s) => s.setLevel);

  const { playAnimation } = useAgentAnimations(ref);
  const animations: AgentAnimation[] = ["jump", "roll", "squash", "shake"];
  const [animationIndex, setAnimationIndex] = useState(0);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    const currentAnimation = animations[animationIndex];
    playAnimation(currentAnimation);
    onInteract(currentAnimation);
    setAnimationIndex((prevIndex) => (prevIndex + 1) % animations.length);
    setLevel((prev) => prev + 0.1);
  };

  return (
    <group onPointerDown={handlePointerDown}>
      <primitive
        ref={ref}
        object={clonedScene}
        position={[0, -1.5, 0]}
        scale={2}
      />
    </group>
  );
}
