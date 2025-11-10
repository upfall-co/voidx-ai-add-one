import { create } from "zustand";

type InteractionState = {
  level: number;
  hoverTime: number;
};

type InteractionActions = {
  setLevel: (level: number | ((prevLevel: number) => number)) => void;
  setHoverTime: (
    hoverTime: number | ((prevHoverTime: number) => number)
  ) => void;
};

export const useInteractionStore = create<
  InteractionState & InteractionActions
>((set, get) => ({
  level: 1,
  hoverTime: 0,

  setLevel: (newLevel) =>
    set((state) => {
      const maxLevel = 5;
      const potentialNewLevel =
        typeof newLevel === "function" ? newLevel(state.level) : newLevel;

      if (state.level >= maxLevel) {
        return { level: maxLevel };
      }

      const currentLevelInt = Math.floor(state.level);
      const newLevelInt = Math.floor(potentialNewLevel);

      let finalLevel = state.level;
      if (newLevelInt > currentLevelInt) {
        finalLevel = newLevelInt;
      } else {
        finalLevel = potentialNewLevel;
      }

      return { level: Math.min(finalLevel, maxLevel) };
    }),
  setHoverTime: (hoverTime) => {
    const newHoverTime =
      typeof hoverTime === "function" ? hoverTime(get().hoverTime) : hoverTime;
    set({
      hoverTime: newHoverTime,
    });
  },
}));
