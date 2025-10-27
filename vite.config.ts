import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths"; // 1. 플러그인 임포트

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.bin"],

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
