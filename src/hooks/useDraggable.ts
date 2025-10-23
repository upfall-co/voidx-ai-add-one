import { useEffect, useRef } from "react";

export default function useDraggable(
  ref: React.RefObject<HTMLElement>,
  isPinned: boolean
) {
  const isDragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el || isPinned) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      offset.current = {
        x: e.clientX - el.offsetLeft,
        y: e.clientY - el.offsetTop,
      };
      document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.body.style.userSelect = "";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      el.style.left = `${e.clientX - offset.current.x}px`;
      el.style.top = `${e.clientY - offset.current.y}px`;
    };

    const handle = el.querySelector(".cursor-grab");
    handle?.addEventListener("mousedown", onMouseDown as EventListener);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      handle?.removeEventListener("mousedown", onMouseDown as EventListener);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [ref, isPinned]);
}
