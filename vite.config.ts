import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    try {
      const tagger = await import("@dyad-sh/react-vite-component-tagger");
      if (tagger?.default) {
        plugins.push(tagger.default());
      }
    } catch {
      // Ignora se o plugin não estiver presente em certos ambientes
    }
  }

  return {
    envPrefix: ['VITE_', 'NEXT_PUBLIC_', 'SUPABASE_'],
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});