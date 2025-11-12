import { useChatbotStore } from "@/stores/chatbotStore";
import { useMessageStore } from "@/stores/messageStore";
import { useInteractionStore } from "@/stores/scenarioStore";
import { useSmartPopupStore } from "@/stores/smartPopupStore";
import { useEffect, useRef } from "react";
import { useGetElement } from "./useGetElement";

const CHAT_RESPONSE_DELAY = 1000;
const NUDGE_TRIGGER_DELAY = 5000;

export function useMockWebSocket() {
  const { messages, addMessage } = useMessageStore();
  const { setIsOpen: setPopupIsOpen, setPosition } = useSmartPopupStore();
  const hit = useGetElement();

  const lastProcessedId = useRef<string | null>(null);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage &&
      lastMessage.role === "user" &&
      lastMessage.id !== lastProcessedId.current
    ) {
      if (
        lastMessage.type === "chat" &&
        messages.find(
          (m) =>
            m.type === "nudge" &&
            m.role === "user" &&
            m.content === lastMessage.content
        )
      ) {
        lastProcessedId.current = lastMessage.id;
        return;
      }

      lastProcessedId.current = lastMessage.id;

      const timer = setTimeout(() => {
        const responseContent = `"${lastMessage.content}"(이)라고 하셨네요. 
이것은 가상 봇 응답입니다. 🤖`;

        addMessage({
          role: "bot",
          content: responseContent,
          type: lastMessage.type,
        });
      }, CHAT_RESPONSE_DELAY);

      return () => clearTimeout(timer);
    }
  }, [messages, addMessage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const { isOpen: isChatOpen } = useChatbotStore.getState();

      if (isChatOpen) {
        addMessage({
          role: "bot",
          content: `(시뮬레이션) 🤖
챗봇이 열려있네요! 
궁금한 점을 물어보세요!`,
          type: "chat",
        });
      } else {
        setPosition({
          x: window.innerWidth / 2 - 200,
          y: window.innerHeight / 2 - 100,
        });

        setPopupIsOpen(true);

        addMessage({
          role: "bot",
          content: `(시뮬레이션) 🤖
혹시 도움이 필요하신가요? 
궁금한 점을 물어보세요!`,
          type: "nudge",
        });
      }
    }, NUDGE_TRIGGER_DELAY);

    return () => clearTimeout(timer);
  }, [addMessage, setPopupIsOpen, setPosition]);

  const HOVER_THRESHOLD_MS = 1200;
  const COOLDOWN_PER_ELEMENT_MS = 6000;
  const GLOBAL_MIN_GAP_MS = 2000;

  const setHoverTime = useInteractionStore((s) => s.setHoverTime);

  // 현재 추적 중인 엘리먼트와 시작 시각
  const activeElRef = useRef<Element | null>(null);
  const startAtRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  // 요소별/전역 쿨다운
  const lastNudgedAtRef = useRef<number>(0);
  const elementCooldownRef = useRef<WeakMap<Element, number>>(new WeakMap());

  // 유틸: IMG/BUTTON만 허용
  const isTarget = (el: Element | null, tagName?: string | null) => {
    if (!el || !tagName) return false;
    const t = tagName.toUpperCase();
    return t === "IMG" || t === "BUTTON";
  };

  // rAF 루프
  const loop = () => {
    rafRef.current = null;
    const el = activeElRef.current;
    if (!el) return;

    const now = performance.now();
    const elapsed = Math.max(0, now - startAtRef.current);
    const progress = Math.min(100, (elapsed / HOVER_THRESHOLD_MS) * 100);

    setHoverTime(progress);

    if (progress >= 100) {
      // console.log(el);
      const lastForEl = elementCooldownRef.current.get(el) || 0;
      const nowMs = Date.now();
      const gapOk = nowMs - lastNudgedAtRef.current >= GLOBAL_MIN_GAP_MS;
      const cdOk = nowMs - lastForEl >= COOLDOWN_PER_ELEMENT_MS;

      if (gapOk && cdOk) {
        const x = Math.max(
          8,
          Math.min(
            (hit.clientX ?? window.innerWidth / 2) + 12,
            window.innerWidth - 400
          )
        );
        const y = Math.max(
          8,
          Math.min(
            (hit.clientY ?? window.innerHeight / 2) + 12,
            window.innerHeight - 160
          )
        );
        setPosition({ x, y });
        setPopupIsOpen(true);
        const tag = (hit.element?.tagName || hit.tagName).toUpperCase();
        const content =
          tag === "IMG"
            ? `(시뮬레이션) 🖼️
이미지 위에 마우스를 살짝 올려보세요. 확대/상세 기능이 있을 수 있어요.`
            : tag === "BUTTON"
            ? `(시뮬레이션) 🔘
이 버튼을 클릭해보세요. 다음 단계로 진행할 수 있어요.`
            : null;

        addMessage({ role: "bot", content, type: "nudge" });
        lastNudgedAtRef.current = nowMs;
        elementCooldownRef.current.set(el, nowMs);
      }

      startAtRef.current = now;
      setHoverTime(0);
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const el = (hit.element as Element | null) ?? null;
    const eligible = isTarget(el, hit.element?.tagName || hit.tagName);

    if (eligible) {
      if (activeElRef.current !== el) {
        activeElRef.current = el;
        startAtRef.current = performance.now();
        setHoverTime(0);
      }
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(loop);
      }
    } else {
      activeElRef.current = null;
      setHoverTime(0);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current != null && !activeElRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [
    hit.element,
    hit.tagName,
    hit.clientX,
    hit.clientY,
    setHoverTime,
    setPopupIsOpen,
    setPosition,
    addMessage,
  ]);
}
