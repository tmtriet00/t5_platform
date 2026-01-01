import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      interfaces: path.resolve(__dirname, "src/interfaces"),
      utility: path.resolve(__dirname, "src/utility"),
      components: path.resolve(__dirname, "src/components"),
    },
  },
});
