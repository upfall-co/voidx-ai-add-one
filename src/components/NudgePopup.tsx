"use client";

import useDraggable from "@/hooks/useDraggable";
import {
  useVoidxAgentStore,
  type VoidxAgentMessage,
} from "@/stores/voidxAgentStore";
import { useEffect, useRef, useState } from "react";
import { BiSolidSun } from "react-icons/bi";
import {
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaPaperPlane,
  FaThumbtack,
  FaTimes,
} from "react-icons/fa";
import MessageBubble from "./MessageBubble";

// const sendIcon = cdnIconUrl("icon-chatbot-send"); // FaPaperPlane 아이콘으로 대체

export default function NudgePopup({
  initialX,
  initialY,
  nudgeList,
}: {
  initialX: number;
  initialY: number;
  nudgeList: VoidxAgentMessage[];
}) {
  const isSleeping = useVoidxAgentStore((s) => s.isSleeping);
  const { setIsSleeping, addMessage, clearMessagesByType } =
    useVoidxAgentStore();

  const [isPin, setIsPin] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // ⭐️ 확장 상태 추가

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null!);
  const messageListRef = useRef<HTMLDivElement>(null!);

  useDraggable(containerRef, isPin);

  const lastMessage = nudgeList[nudgeList.length - 1];
  const quickButtons = lastMessage?.quickButtons || [];

  const handleClose = () => {
    clearMessagesByType("nudge");
    setIsFocus(false);
    setIsHovering(false);
    setIsPin(false);
    setIsExpanded(false); // ⭐️ 닫을 때 확장 상태 초기화
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const content = inputValue.trim();
    if (!content) return;
    addMessage({ role: "user", content, type: "nudge" });
    setInputValue("");
    setIsExpanded(true); // ⭐️ 메시지 전송 시 자동으로 확장
  };

  useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      const { innerWidth, innerHeight } = window;
      const margin = 32; // 화면 가장자리로부터의 최소 여백

      let adjustedX = initialX;
      let adjustedY = initialY;

      if (initialX + offsetWidth > innerWidth) {
        adjustedX = innerWidth - offsetWidth - margin;
      }
      if (initialY + offsetHeight > innerHeight) {
        adjustedY = innerHeight - offsetHeight - margin;
      }
      if (initialX < 0) {
        adjustedX = margin;
      }
      if (initialY < 0) {
        adjustedY = margin;
      }
      containerRef.current.style.left = `${adjustedX}px`;
      containerRef.current.style.top = `${adjustedY}px`;
    }
  }, [initialX, initialY]);

  useEffect(() => {
    if (nudgeList.length > 0 && !isPin && !isFocus && !isHovering) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        clearMessagesByType("nudge");
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nudgeList, isPin, isFocus, isHovering, clearMessagesByType]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [nudgeList]);

  useEffect(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      const { innerWidth, innerHeight } = window;
      const margin = 32;

      let adjustedX = initialX;
      let adjustedY = initialY;

      if (initialX + offsetWidth > innerWidth) {
        adjustedX = innerWidth - offsetWidth - margin;
      }
      if (initialY + offsetHeight > innerHeight) {
        adjustedY = innerHeight - offsetHeight - margin;
      }
      if (initialX < 0) {
        adjustedX = margin;
      }
      if (initialY < 0) {
        adjustedY = margin;
      }
      containerRef.current.style.left = `${adjustedX}px`;
      containerRef.current.style.top = `${adjustedY}px`;
    }
  }, [initialX, initialY]);

  useEffect(() => {
    if (nudgeList.length > 0 && !isPin && !isFocus && !isHovering) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleClose(); // ⭐️ 5초 후 handleClose 호출
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nudgeList, isPin, isFocus, isHovering, clearMessagesByType]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [nudgeList, isExpanded]); // ⭐️ isExpanded 변경 시에도 스크롤

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="fixed z-999 flex w-[400px] min-h-[180px] flex-col rounded-lg border text-black/90 backdrop-blur-lg bg-white/70 drop-shadow-lg"
      style={{
        left: initialX,
        top: initialY,
        opacity,
      }}
    >
      {/* === Header === */}
      <div className="flex flex-col items-center w-full">
        {/* Handle */}
        <div
          className={`draggable-handle w-full select-none p-2 ${
            isPin ? "" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <div className="mx-auto h-[5px] w-[60px] rounded-full bg-[#d0d0d0]" />
        </div>
        {/* Controls */}
        <div className="flex items-center justify-between w-full px-3 pb-1 text-black/70">
          <div className="flex">
            <button
              onClick={() => setIsSleeping(!isSleeping)}
              className="rounded-md p-1.5 hover:bg-black/10"
              aria-pressed={isSleeping}
            >
              {isSleeping ? (
                <FaMoon className="w-4 h-4" />
              ) : (
                <BiSolidSun className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsPin(!isPin)}
              className="rounded-md p-1.5 hover:bg-black/10"
              aria-pressed={isPin}
            >
              <FaThumbtack className={`w-4 h-4 ${isPin ? "" : "opacity-60"}`} />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              aria-label="opacity"
              className="
                h-1 w-20 cursor-pointer appearance-none rounded-full bg-black/10
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-none
                [&::-webkit-slider-thumb]:ring-2
                [&::-webkit-slider-thumb]:ring-black/10
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:ring-2
                [&::-moz-range-thumb]:ring-black/10
              "
            />
            <button
              className="rounded-md p-1.5 hover:bg-black/10"
              onClick={handleClose}
              aria-label="close nudge"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-6 pb-4">
        <div
          ref={messageListRef}
          className="flex max-h-[480px] flex-col gap-2 overflow-y-auto p-2 scroll-smooth"
        >
          {nudgeList.length > 0 ? (
            isExpanded ? (
              nudgeList.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role}>
                  {msg.content}
                </MessageBubble>
              ))
            ) : (
              <div
                className="text-sm"
                dangerouslySetInnerHTML={{
                  __html: lastMessage.content,
                }}
              />
            )
          ) : null}
          <button
            className="self-center mt-2 text-gray-500"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <FaChevronUp className="w-3 h-3" />
            ) : (
              <FaChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Quick Buttons & Input */}
        <div className="flex flex-col">
          {quickButtons.length > 0 && (
            <div className="flex gap-2 mb-2 overflow-x-auto">
              {quickButtons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => button.onClick?.()}
                  className="shrink-0 rounded-full border-none bg-[#e6f5ff] px-3 py-1 text-xs text-[#279af9] hover:opacity-80"
                >
                  {button.label}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={handleSubmit}
            className="flex items-center w-full gap-2 px-3 py-1 bg-white rounded-full shadow-sm"
          >
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              placeholder="궁금한 점을 바로 물어보세요!"
              className="w-full text-sm text-black bg-transparent outline-none placeholder:text-gray-500 focus:shadow-none focus:ring-0"
            />
            <button
              type="submit"
              className="p-1 text-gray-400 hover:text-gray-700"
              aria-label="send message"
            >
              <FaPaperPlane className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
