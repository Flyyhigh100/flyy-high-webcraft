import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 4000,
    strictPort: true,
    host: '127.0.0.1',
    open: true, // automatically open browser
    proxy: {
      '/api/domain-check': {
        target: 'https://domain-availability.whoisxmlapi.com/api/v1',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Add the API key to the request
            const url = new URL(req.url, 'http://localhost');
            url.searchParams.append('apiKey', process.env.WHOIS_API_KEY || 'at_OismLMJ7VEed3qZ9bUIEe9zMJDC6T');
            
            // Rewrite the URL to include the API key
            proxyReq.path = url.pathname + url.search;
          });
        },
        rewrite: (path) => {
          // Extract the domain parameter from the original request
          const url = new URL(path, 'http://localhost');
          const domain = url.searchParams.get('domain');
          
          // Create a new URL for the WhoisXML API
          if (domain) {
            return `?domainName=${domain}`;
          }
          return path;
        },
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
