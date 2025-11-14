import { cdnUrl } from "@/constant/common";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { useChatbotStore } from "./chatbotStore";

describe("useChatbotStore (Zustand)", () => {
  it("초기 상태가 올바르게 설정되어야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.opacity).toBe(1);
    expect(result.current.arkPreview).toBe(
      `${cdnUrl}/icons/3d_1button-icon-SVG.svg`
    );
    expect(result.current.arkGlb).toBe(`${cdnUrl}/3d/ark_model_00.glb`);
    expect(result.current.mode).toBe("sleeping");
    expect(result.current.input).toBe("");
  });

  it("setIsOpen 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it("setOpacity 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());

    act(() => {
      result.current.setOpacity(0.5);
    });
    expect(result.current.opacity).toBe(0.5);

    act(() => {
      result.current.setOpacity(0);
    });
    expect(result.current.opacity).toBe(0);

    act(() => {
      result.current.setOpacity(1);
    });
    expect(result.current.opacity).toBe(1);
  });

  it("setArkPreview 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());
    const testUrl = "path/to/preview.svg";

    act(() => {
      result.current.setArkPreview(testUrl);
    });

    expect(result.current.arkPreview).toBe(testUrl);
  });

  it("setArkGlb 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());
    const testUrl = "path/to/model.glb";

    act(() => {
      result.current.setArkGlb(testUrl);
    });

    expect(result.current.arkGlb).toBe(testUrl);
  });

  it("setMode 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());

    act(() => {
      result.current.setMode("chatting");
    });
    expect(result.current.mode).toBe("chatting");

    act(() => {
      result.current.setMode("360");
    });
    expect(result.current.mode).toBe("360");

    act(() => {
      result.current.setMode("sleeping");
    });
    expect(result.current.mode).toBe("sleeping");
  });

  it("setInput 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useChatbotStore());
    const testInput = "Hello, World!";

    act(() => {
      result.current.setInput(testInput);
    });
    expect(result.current.input).toBe(testInput);

    act(() => {
      result.current.setInput("");
    });
    expect(result.current.input).toBe("");
  });
});
