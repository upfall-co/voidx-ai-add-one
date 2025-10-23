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
    agentUrl = useVoidxAgentStore((s) => s.agentUrl),
    chatbotButtonUrl = useVoidxAgentStore((s) => s.chatbotButtonUrl);
  const addMessage = useVoidxAgentStore((s) => s.addMessage),
    level = useVoidxAgentStore((s) => s.level),
    setLevel = useVoidxAgentStore((s) => s.setLevel);
  const backgroundUrl = useVoidxAgentStore((s) => s.backgroundUrl);

  const containerRef = useRef<HTMLDivElement>(null);
  const chattingBodyRef = useRef<HTMLDivElement>(null);

  const agentLevel = Math.floor(level) < 1 ? 1 : Math.floor(level);
  const agentExp = (level - Math.floor(level)) * 100;

  const lastMessage = messages[messages.length - 1];
  const quickButtons = lastMessage?.quickButtons || [];

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
          className="max-h-[600px] fixed bottom-[5vh] right-[2vw] z-1000 flex max-w-125 flex-col overflow-hidden rounded-2xl border border-white/35 shadow-2xl backdrop-blur-xl saturate-150"
          style={{ opacity }}
        >
          {/* Header */}
          <header className="flex items-center justify-between px-6 py-4 bg-white/50 text-black/60">
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="
    h-1 w-20 cursor-pointer appearance-none rounded-full bg-black/10
    [&::-webkit-slider-thumb]:h-3
    [&::-webkit-slider-thumb]:w-3
    [&::-webkit-slider-thumb]:appearance-none
    [&::-webkit-slider-thumb]:rounded-full
    [&::-webkit-slider-thumb]:bg-white
    [&::-webkit-slider-thumb]:shadow-md
    [&::-moz-range-thumb]:h-4
    [&::-moz-range-thumb]:w-4
    [&::-moz-range-thumb]:rounded-full
    [&::-moz-range-thumb]:bg-white
    [&::-moz-range-thumb]:shadow-md
  "
            />
            <div
              className={`draggable-handle w-full h-2 select-none p-2 text-center font-semibold ${
                pinned ? "" : "cursor-grab active:cursor-grabbing"
              }`}
            >
              <div className="mx-auto h-[5px] w-[60px] rounded-full bg-neutral-400/80" />
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-md hover:bg-black/10"
                onClick={() => setIsSleeping(!isSleeping)}
              >
                {/* {isSleeping ? (
                  <MoonIcon className="w-4 h-4" />
                ) : (
                  <SunIcon className="w-4 h-4" />
                )} */}
              </button>
              <button
                className="rounded-md hover:bg-black/10"
                onClick={() => setPinned(!pinned)}
              >
                {/* {pinned ? (
                  <LockClosedIcon className="w-4 h-4" />
                ) : (
                  <LockOpenIcon className="w-4 h-4" />
                )} */}
              </button>
              <button
                className="rounded-md hover:bg-black/10"
                onClick={() => setChatOpen(false)}
              >
                {/* <XMarkIcon className="w-4 h-4" /> */}
              </button>
            </div>
          </header>

          {/* 3D Agent View */}
          <div className="relative mx-6 mt-6 h-[300px] shrink-0">
            <TestRoom />
          </div>

          {/* Level & EXP Bar */}
          <div className="flex items-center gap-3 mx-6 mt-4 shrink-0">
            <div className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
              Lv.{agentLevel >= 5 ? "MAX" : agentLevel}
            </div>
            <div className="flex-1 w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${agentExp}%` }}
              />
            </div>
          </div>

          {/* Message Body */}
          <div
            ref={chattingBodyRef}
            className="flex flex-col flex-1 gap-2 p-8 overflow-y-auto scroll-smooth"
          >
            {messages.map((msg, i) => (
              <MessageBubble key={i} role={msg.role}>
                {msg.content}
              </MessageBubble>
            ))}
          </div>

          {/* Input Area */}
          <div className="relative px-4 pt-2 pb-4 mt-2 shrink-0">
            {quickButtons.length > 0 && (
              <div className="absolute flex gap-2 pb-1 mb-3 overflow-x-auto left-4 right-4 -top-10 backdrop-blur-xl backdrop-saturate-150">
                {quickButtons.map((button, index) => (
                  <button
                    key={index}
                    onClick={() => button.onClick?.()}
                    className="p-2 text-xs text-black rounded-full shrink-0 bg-sky/45"
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="adsf"
                className="w-full rounded-full border border-white/35 bg-white/75 py-3 pl-5 pr-14 text-[15px] outline-none placeholder:font-medium placeholder:text-black/30 backdrop-blur-xl saturate-150"
              />
              <button
                type="submit"
                className="absolute p-0 -translate-y-1/2 right-4 top-1/2 bg-none"
              >
                <img src={sendIcon} alt="send" className="w-5 h-" />
              </button>
            </form>
          </div>
        </div>
      )}

      {!chatOpen && chatbotButtonUrl && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-[6vh] right-[2vw] z-999 cursor-pointer h-16 w-16 animate-pulse rounded-full bg-black p-0 shadow-lg hover:animate-none"
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
