import type { ClientMessage, MessageRole, MessageType } from "@/types/message";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useMessageStore } from "./messageStore";
// 가짜 UUID 생성 함수 설정
const mockUUIDs = ["uuid-1", "uuid-2", "uuid-3", "uuid-4", "uuid-5"];
let uuidIndex = 0;

/**
 * globalThis : 전역 객체를 가리키며, 브라우저 환경에서는 window 객체와 동일
 * crypto : 암호화 관련 기능을 제공하는 웹 API의 일부로, 보안 랜덤 값 생성 등에 사용
 * randomUUID : 고유한 식별자를 생성하는 메서드로, 주로 객체나 세션 등을 식별하는 데 사용
 * Object.defineProperty : 객체의 속성을 정의하거나 수정하는 메서드
 * writable : 속성이 쓰기 가능한지 여부를 지정하는 옵션
 * configurable : 속성이 재정의 가능한지 여부를 지정하는 옵션
 */

Object.defineProperty(globalThis.crypto, "randomUUID", {
  value: () => {
    const uuid = mockUUIDs[uuidIndex % mockUUIDs.length];
    uuidIndex++;
    return uuid;
  },
  writable: true,
  configurable: true,
});

describe("useMessageStore (Zustand)", () => {
  beforeEach(() => {
    act(() => {
      useMessageStore.setState({ messages: [] });
    });
    uuidIndex = 0;
  });

  it("초기 상태가 올바르게 설정되어야 합니다.", () => {
    const { result } = renderHook(() => useMessageStore());
    expect(result.current.messages).toEqual([]);
  });

  it("setMessages 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useMessageStore());
    const newMessages: ClientMessage[] = [
      { id: "1", role: "user", content: "Hello", type: "chat" },
    ];

    act(() => {
      result.current.setMessages(newMessages);
    });
    expect(result.current.messages).toEqual(newMessages);
  });

  it("addMessage 액션이 'chat' 타입 메시지를 올바르게 추가해야 합니다.", () => {
    const { result } = renderHook(() => useMessageStore());
    const chatMessage = {
      role: "user" as MessageRole,
      content: "Test chat message",
      type: "chat" as MessageType,
    };

    act(() => {
      result.current.addMessage(chatMessage);
    });

    expect(result.current.messages).toEqual([{ ...chatMessage, id: "uuid-1" }]);
  });

  it("removeMessage 액션이 메시지를 올바르게 제거해야 합니다.", () => {
    const { result } = renderHook(() => useMessageStore());
    const initialMessages: ClientMessage[] = [
      { id: "a", role: "user", content: "Msg 1", type: "chat" },
      { id: "b", role: "bot", content: "Msg 2", type: "chat" },
      { id: "c", role: "user", content: "Msg 3", type: "chat" },
    ];

    act(() => {
      result.current.setMessages(initialMessages);
    });
    expect(result.current.messages).toEqual(initialMessages);

    act(() => {
      result.current.removeMessage(1); // Remove Msg 2
    });
    expect(result.current.messages).toEqual([
      { id: "a", role: "user", content: "Msg 1", type: "chat" },
      { id: "c", role: "user", content: "Msg 3", type: "chat" },
    ]);

    act(() => {
      result.current.removeMessage(0); // Remove Msg 1
    });
    expect(result.current.messages).toEqual([
      { id: "c", role: "user", content: "Msg 3", type: "chat" },
    ]);

    act(() => {
      result.current.removeMessage(0); // Remove Msg 3
    });
    expect(result.current.messages).toEqual([]);
  });

  it("clearMessages 액션이 모든 메시지를 제거해야 합니다.", () => {
    const { result } = renderHook(() => useMessageStore());
    const initialMessages: ClientMessage[] = [
      { id: "1", role: "user", content: "Hello", type: "chat" },
    ];

    act(() => {
      result.current.setMessages(initialMessages);
    });
    expect(result.current.messages).toEqual(initialMessages);

    act(() => {
      result.current.clearMessages();
    });
    expect(result.current.messages).toEqual([]);
  });
});
