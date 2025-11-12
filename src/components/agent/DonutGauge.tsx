import { useInteractionStore } from "@/stores/interactionStore";
import { useEffect, useRef } from "react";
import { buildStyles, CircularProgressbar } from "react-circular-progressbar";

export default function DonutGauge() {
  const pointer = useRef({ x: 0, y: 0 });

  const hoverTime = useInteractionStore((s) => s.hoverTime);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  if (hoverTime < 1) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: pointer.current.y,
        left: pointer.current.x,
        width: 32,
        height: 32,
        zIndex: 9999,
        pointerEvents: "none",
        transform: "translate(-50%, -50%)",
      }}
    >
      <CircularProgressbar
        value={hoverTime}
        strokeWidth={20}
        styles={buildStyles({
          pathColor: "#ffffff",
          trailColor: "rgba(255, 255, 255, 0.3)",
        })}
      />
    </div>
  );
}
