import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  assetsInclude: ["**/*.glb", "**/*.gltf", "**/*.bin"],

  test: {
    globals: false,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/tests", "src/types", "src/Main.tsx"],
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
        assetFileNames: "assets/[name].[hash][extname]",
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
