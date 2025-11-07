import { useAgentStore } from "@/stores/agentStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { motion, useDragControls } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { BiSolidSun } from "react-icons/bi";
import {
  FaChevronDown,
  FaChevronUp,
  FaMoon,
  FaThumbtack,
} from "react-icons/fa";
import { PiPaperPlaneFill } from "react-icons/pi";
import MessageBubble from "./MessageBubble";

const popupSize = { width: 400, height: 400 };
const estimatedWidth = popupSize.width;
const estimatedHeight = popupSize.height;

export default function SmartNudgePopup() {
  const nudgeList = [];
  const lastMessage = nudgeList[nudgeList.length - 1] || {
    role: "system",
    content: "아직 받은 메시지가 없습니다.",
    contentType: "text",
  };

  const { x: initialX, y: initialY } = useSmartPopupStore((s) => s.position);

  const asleep = useAgentStore((s) => s.asleep);
  const setAsleep = useAgentStore((s) => s.setAsleep);
  const isMobile = useMemo(() => window.innerWidth < 768, []);

  const [isPin, setIsPin] = useState(false);
  const [isFocus, setIsFocus] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const dragControls = useDragControls();

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null!);
  const formRef = useRef<HTMLFormElement>(null);

  const margin = 32;

  const { initialLeft, initialTop } = useMemo(() => {
    const { innerWidth, innerHeight } = window;

    let adjustedX = initialX;
    let adjustedY = initialY;

    if (initialX + estimatedWidth > innerWidth) {
      adjustedX = innerWidth - estimatedWidth - margin;
    }
    if (initialY + estimatedHeight > innerHeight) {
      adjustedY = innerHeight - estimatedHeight - margin;
    }
    if (initialX < 0) {
      adjustedX = margin;
    }
    if (initialY < 0) {
      adjustedY = margin;
    }
    return { initialLeft: adjustedX, initialTop: adjustedY };
  }, [initialX, initialY, popupSize.width, popupSize.height]);

  const handleClose = () => {
    setIsFocus(false);
    setIsHovering(false);
    setIsPin(false);
    setIsExpanded(false);
  };

  const submitMessage = () => {
    const content = inputValue.trim();
    if (!content) return;
    setInputValue("");
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
    if (nudgeList.length > 0 && !isPin && !isFocus && !isHovering) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        handleClose();
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nudgeList, isPin, isFocus, isHovering, handleClose]);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isExpanded]);

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="fixed z-999 flex w-[400px] min-h-[180px] flex-col gap-5 rounded-2xl text-black/90 backdrop-blur-lg bg-white/70 drop-shadow-lg p-5"
      style={{
        left: initialLeft,
        top: initialTop,
      }}
      drag={!isPin}
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: opacity, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex gap-4">
          <button onClick={() => setAsleep(!asleep)} aria-pressed={asleep}>
            {asleep ? (
              <FaMoon className="w-4 h-4" />
            ) : (
              <BiSolidSun className="w-4 h-4" />
            )}
          </button>
          <button onClick={() => setIsPin(!isPin)} aria-pressed={isPin}>
            <FaThumbtack className={`w-4 h-4 ${isPin ? "" : "opacity-60"}`} />
          </button>
        </div>

        <div
          onPointerDown={(e) => {
            if (!isPin) {
              dragControls.start(e);
            }
          }}
          className={`draggable-handle w-full select-none p-2 ${
            isPin ? "" : "cursor-grab active:cursor-grabbing"
          }`}
        >
          <div className="mx-auto h-[5px] w-[60px] rounded-full bg-[#d0d0d0]" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            aria-label="opacity"
            className="
                  h-1 w-20 cursor-pointer appearance-none rounded-full bg-black/30
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:shadow-none
                  [&::-webkit-slider-thumb]:ring-1
                   [&::-webkit-slider-thumb]:ring-black/10
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:ring-2
                [&::-moz-range-thumb]:ring-black/10
              "
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div
          ref={messageListRef}
          className="flex max-h-[480px] flex-col gap-2 overflow-y-auto scroll-smooth"
        >
          {nudgeList.length > 0 ? (
            isExpanded ? (
              nudgeList.map((msg, idx) => (
                <MessageBubble key={idx} role={msg.role}>
                  {msg.content}
                </MessageBubble>
              ))
            ) : (
              <MessageBubble
                role={lastMessage.role}
                contentType={lastMessage.contentType}
              >
                {lastMessage.content}
              </MessageBubble>
            )
          ) : (
            <div className="px-4 py-2.5 max-h-[480px] text-center text-sm text-black/40">
              메시지가 없습니다.
            </div>
          )}
          <button
            className="self-center mt-2 text-black/30"
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

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex items-center w-full gap-2 px-4 py-3 bg-white/40 rounded-full"
        >
          <textarea
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            placeholder="궁금한 점을 바로 물어보세요!"
            className="w-full text-sm text-black resize-none bg-transparent outline-none placeholder:text-gray-500 focus:shadow-none focus:ring-0"
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
    </motion.div>
  );
}
