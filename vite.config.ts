/// <reference types="vitest" />
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.bin"],

  test: {
    globals: true, // 'test', 'it', 'expect' 등을 import 없이 전역으로 사용
    environment: "jsdom", // 테스트 환경을 'jsdom'으로 설정
    setupFiles: "./src/tests/setup.ts", // 1단계에서 만든 설정 파일 경로
    coverage: {
      provider: "v8", // 커버리지 엔진
      reporter: ["text", "json", "html"], // 리포트 형식
      include: ["src/**/*.{ts,tsx}"], // 커버리지 측정 대상
      exclude: ["src/tests", "src/types", "src/Main.tsx"], // 커버리지 제외 대상
    },
  },

  build: {
    lib: {
      entry: path.resolve(__dirname, "src/Main.tsx"),
      name: "VoidxAIAddon",
      fileName: (format) => `voidx-ai-addon.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      output: {
        // 에셋이 꼭 dist/assets 밑으로 떨어지도록 강제
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
  },
});
