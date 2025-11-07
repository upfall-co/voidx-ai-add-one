import { cdnUrl } from "@/constant/common";
import { useAgentStore } from "@/stores/agentStore";
import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { useEffect } from "react";
import CursorAgent from "./agent/CursorAgent";
import DonutGauge from "./agent/DonutGauge";
import Chatbot from "./chatbot/Chatbot";
import SmartNudgePopup from "./popup/SmartNudgePopup";

export default function VoidxProvider() {
  const addMessage = useMessageStore((s) => s.addMessage);
  const setGlb = useAgentStore((s) => s.setGlb);
  const setChatIsOpen = useChatbotStore((s) => s.setIsOpen);

  useEffect(() => {
    addMessage({ role: "user", content: "Hello!", type: "nudge" });
  }, []);

  useEffect(() => {
    setChatIsOpen(true);
    setGlb(`${cdnUrl}/3d/Virtualis-walking.glb`);
  }, [setGlb]);

  return (
    <div id="voidx-ai-provider">
      <SmartNudgePopup />
      <Chatbot />
      <CursorAgent />
      <DonutGauge />
    </div>
  );
}
