import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths"; // 1. 플러그인 임포트

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // 2. 플러그인 실행
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/Main.tsx"),
      name: "voidx-ai-addon",
      fileName: (format) => `voidx-ai-addon.${format}.js`,
      formats: ["umd", "es"],
    },
  },
});
