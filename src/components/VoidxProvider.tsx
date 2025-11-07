import { cdnUrl } from "@/constant/common";
import { useMockWebSocket } from "@/hooks/useMockWebSocket";
import { useAgentStore } from "@/stores/agentStore";
import { useEffect } from "react";
import CursorAgent from "./agent/CursorAgent";
import DonutGauge from "./agent/DonutGauge";
import Chatbot from "./chatbot/Chatbot";
import SmartNudgePopup from "./popup/SmartNudgePopup";

export default function VoidxProvider() {
  const setGlb = useAgentStore((s) => s.setGlb);
  useMockWebSocket();
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
