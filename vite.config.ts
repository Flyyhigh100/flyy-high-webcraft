import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    strictPort: false,
    host: 'localhost',
    proxy: {
      '/api/domain-check': {
        target: 'http://localhost:3000/api/domain-check',
        changeOrigin: true,
        rewrite: () => '',
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Make environment variables available
  define: {
    'process.env.WHOIS_API_KEY': JSON.stringify(process.env.WHOIS_API_KEY || 'at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T'),
  },
}));
