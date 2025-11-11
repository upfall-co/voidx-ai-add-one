import { act, renderHook } from "@testing-library/react";
import { useInteractionStore } from "./scenarioStore";

describe("useInteractionStore (Zustand)", () => {
  beforeEach(() => {
    // Reset the store before each test
    act(() => {
      useInteractionStore.setState({ level: 1, hoverTime: 0 });
    });
  });

  it("초기 상태가 올바르게 설정되어야 합니다.", () => {
    const { result } = renderHook(() => useInteractionStore());
    expect(result.current.level).toBe(1);
    expect(result.current.hoverTime).toBe(0);
  });

  describe("setLevel", () => {
    it("숫자 값을 사용하여 레벨을 올바르게 설정해야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setLevel(2);
      });
      expect(result.current.level).toBe(2);

      act(() => {
        result.current.setLevel(4.5);
      });
      expect(result.current.level).toBe(4.5);
    });

    it("함수 값을 사용하여 레벨을 올바르게 설정해야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setLevel((prev) => prev + 1);
      });
      expect(result.current.level).toBe(2);

      act(() => {
        result.current.setLevel((prev) => prev + 0.5);
      });
      expect(result.current.level).toBe(2.5);
    });

    it("레벨이 maxLevel (5)을 초과하지 않아야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setLevel(4);
      });
      expect(result.current.level).toBe(4);

      act(() => {
        result.current.setLevel(6); // Should be capped at 5
      });
      expect(result.current.level).toBe(5);

      act(() => {
        result.current.setLevel((prev) => prev + 2); // Current 5, should remain 5
      });
      expect(result.current.level).toBe(5);
    });

    it("현재 레벨이 maxLevel에 도달하면 더 이상 증가하지 않아야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setLevel(5);
      });
      expect(result.current.level).toBe(5);

      act(() => {
        result.current.setLevel(5.1); // Should remain 5
      });
      expect(result.current.level).toBe(5);

      act(() => {
        result.current.setLevel((prev) => prev + 1); // Should remain 5
      });
      expect(result.current.level).toBe(5);
    });

    it("정수 레벨이 증가할 때만 레벨이 정수로 업데이트되어야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setLevel(1.5);
      });
      expect(result.current.level).toBe(1.5);

      act(() => {
        result.current.setLevel(2.1); // current 1.5, new 2.1. floor(2.1) > floor(1.5) -> level becomes 2.1
      });
      expect(result.current.level).toBe(2.1);

      act(() => {
        result.current.setLevel(2.0); // current 2.1, new 2.0. floor(2.0) not > floor(2.1) -> level becomes 2.0
      });
      expect(result.current.level).toBe(2.0);

      act(() => {
        result.current.setLevel((prev) => prev + 0.5); // current 2.0, new 2.5. floor(2.5) not > floor(2.0) -> level becomes 2.5
      });
      expect(result.current.level).toBe(2.5);

      act(() => {
        result.current.setLevel((prev) => prev + 0.6); // current 2.5, new 3.1. floor(3.1) > floor(2.5) -> level becomes 3.1
      });
      expect(result.current.level).toBe(3.1);
    });
  });

  describe("setHoverTime", () => {
    it("숫자 값을 사용하여 hoverTime을 올바르게 설정해야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setHoverTime(100);
      });
      expect(result.current.hoverTime).toBe(100);

      act(() => {
        result.current.setHoverTime(500.5);
      });
      expect(result.current.hoverTime).toBe(500.5);
    });

    it("함수 값을 사용하여 hoverTime을 올바르게 설정해야 합니다.", () => {
      const { result } = renderHook(() => useInteractionStore());

      act(() => {
        result.current.setHoverTime((prev) => prev + 100);
      });
      expect(result.current.hoverTime).toBe(100);

      act(() => {
        result.current.setHoverTime((prev) => prev * 2);
      });
      expect(result.current.hoverTime).toBe(200);
    });
  });
});
