import { cdnUrl } from "@/constant/common";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { useAgentStore } from "./agentStore";

describe("useAgentStore (Zustand)", () => {
  it("초기 상태가 올바르게 설정되어야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());

    expect(result.current.preview).toBe("");
    expect(result.current.glb).toBe("");
    expect(result.current.asleep).toBe(false);
  });

  it("setPreview 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());
    const testUrl = "path/to/preview.jpg";
    act(() => {
      result.current.setPreview(testUrl);
    });

    expect(result.current.preview).toBe(testUrl);
  });

  it("setGlb 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());
    const testUrl = `${cdnUrl}/3d/Virtualis-walking.glb`;

    act(() => {
      result.current.setGlb(testUrl);
    });

    expect(result.current.glb).toBe(testUrl);
  });

  it("setAsleep 액션이 상태를 올바르게 변경해야 합니다.", () => {
    const { result } = renderHook(() => useAgentStore());

    expect(result.current.asleep).toBe(false);

    act(() => {
      result.current.setAsleep(true);
    });
    expect(result.current.asleep).toBe(true);

    act(() => {
      result.current.setAsleep(false);
    });
    expect(result.current.asleep).toBe(false);
  });
});
