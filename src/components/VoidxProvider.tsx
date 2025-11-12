import { cdnUrl } from "@/constant/common";
import { useHoverDetector, type HoverTargets } from "@/hooks/useHoverDetector";
import { useAgentStore } from "@/stores/agentStore";
import { useEffect, useMemo } from "react";
import CursorAgent from "./agent/CursorAgent";
import DonutGauge from "./agent/DonutGauge";
import Chatbot from "./chatbot/Chatbot";
import SmartNudgePopup from "./popup/SmartNudgePopup";

// (1) 훅이 감지할 타겟 정의
const MY_TARGETS: HoverTargets = {
  // 1. JSON으로 관리
  ids: ["main-content", "user-profile-button"],
  classNames: ["important-card", "menu-item"],
  semanticTags: ["BUTTON", "MAIN", "NAV", "IMG", "H1"],
  roles: ["navigation", "search"],
};

export default function VoidxProvider() {
  const setGlb = useAgentStore((s) => s.setGlb);

  const targets = useMemo(() => MY_TARGETS, []);
  useHoverDetector(targets, 1500);

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
