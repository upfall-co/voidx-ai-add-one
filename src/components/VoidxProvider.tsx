import { cdnUrl } from "@/constant/common";
import { useHoverDetector, type HoverTargets } from "@/hooks/useHoverDetector";
import { useAgentStore } from "@/stores/agentStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { useEffect, useMemo } from "react";
import CursorAgent from "./agent/CursorAgent";
import DonutGauge from "./agent/DonutGauge";
import Chatbot from "./chatbot/Chatbot";
import SmartNudgePopup from "./popup/SmartNudgePopup";

const MY_TARGETS: HoverTargets = {
  ids: [],
  classNames: [],
  semanticTags: ["BUTTON", "MAIN", "NAV", "IMG", "H1"],
  roles: ["navigation", "search"],
};

export default function VoidxProvider() {
  const setGlb = useAgentStore((s) => s.setGlb);
  const addMessage = useMessageStore((s) => s.addMessage);
  const chatIsOpen = useChatbotStore((s) => s.isOpen);

  const targets = useMemo(() => MY_TARGETS, []);
  const findEl = useHoverDetector(targets, 1500);

  useEffect(() => {
    if (findEl) {
      addMessage({
        type: chatIsOpen ? "chat" : "nudge",
        role: "bot",
        content: findEl.outerHTML,
      });
    }
  }, [findEl]);

  useEffect(() => {
    setGlb(`${cdnUrl}/3d/Virtualis-walking.glb`);
  }, [setGlb]);

  return (
    <>
      <SmartNudgePopup />
      <Chatbot />
      <CursorAgent />
      <DonutGauge />
    </>
  );
}
