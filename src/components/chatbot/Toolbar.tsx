"use client";

import { useAgentStore } from "@/stores/agentStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useInteractionStore } from "@/stores/scenarioStore";
import { BiSolidSun } from "react-icons/bi";
import { FaChevronDown, FaMoon } from "react-icons/fa";

export default function ChatbotToolbar() {
  const setIsOpen = useChatbotStore((s) => s.setIsOpen),
    chatOpacity = useChatbotStore((s) => s.opacity),
    asleep = useAgentStore((s) => s.asleep),
    setAsleep = useAgentStore((s) => s.setAsleep),
    setChatOpacity = useChatbotStore((s) => s.setOpacity),
    level = useInteractionStore((s) => s.level);

  const agentLevel = Math.floor(level) < 1 ? 1 : Math.floor(level);
  const agentExp = (level - Math.floor(level)) * 100;

  return (
    <header className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-4">
        <input
          type="range"
          min="0.2"
          max="1"
          step="0.01"
          value={chatOpacity}
          onChange={(e) => setChatOpacity(parseFloat(e.target.value))}
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
        <div className="flex items-center gap-1 text-black/30">
          <button
            className="p-1 rounded-md hover:bg-black/10 text-[#48494B]/40"
            onClick={() => setAsleep(!asleep)}
          >
            {asleep ? (
              <FaMoon className="w-4 h-4" />
            ) : (
              <BiSolidSun className="w-4 h-4" />
            )}
          </button>
          <button
            className="p-1 rounded-md hover:bg-black/10 text-[#48494B]/40"
            onClick={() => setIsOpen(false)}
          >
            <FaChevronDown className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative w-full h-4 bg-[#c9c9c9] border border-white/60 rounded-full flex items-center pl-4">
        <p className="text-xs text-white">
          Lv.{agentLevel >= 5 ? "MAX" : agentLevel}
        </p>
        <div
          className="h-full w-1/2 bg-[#2C2C2C] rounded-full"
          style={{ width: `${agentExp}%` }}
        />
      </div>
    </header>
  );
}
