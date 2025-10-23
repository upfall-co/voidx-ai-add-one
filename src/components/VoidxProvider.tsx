"use client";

import useMouse from "@/hooks/useMouse";
import { useVoidxAgentStore } from "@/stores/voidxAgentStore";
import { useEffect, useMemo, useState } from "react";
import Chatbot from "./Chatbot";
import CursorAgent from "./CursorAgent";

export default function VoidxProvider() {
  const { current } = useMouse();

  const messages = useVoidxAgentStore((s) => s.messages);
  const isSleeping = useVoidxAgentStore((s) => s.isSleeping);
  const chatOpen = useVoidxAgentStore((s) => s.chatOpen);
  const donutProgress = useVoidxAgentStore((s) => s.donutProgress);

  const [nudgePosition, setNudgePosition] = useState<{
    x: number;
    y: number;
  } | null>();

  const nudgeList = useMemo(
    () => messages.filter((msg) => msg.type === "nudge"),
    [messages]
  );
  const isDonut = useMemo(
    () => donutProgress > 0 && donutProgress < 100,
    [donutProgress]
  );

  useEffect(() => {
    if (nudgeList.length === 1) {
      setNudgePosition({ x: current.x, y: current.y });
    }
  }, [nudgeList.length]);

  return (
    <>
      {/* 
      {!chatOpen && nudgeList.length > 0 && nudgePosition && (
        <NudgePopup
          initialX={nudgePosition.x}
          initialY={nudgePosition.y}
          nudgeList={nudgeList}
        />
      )} */}
      <Chatbot />
      {!isSleeping && <CursorAgent />}
      {/* <DonutGauge isVisible={isDonut} progress={donutProgress} /> */}
    </>
  );
}
