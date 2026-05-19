import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Set VITE_API_URL in your Netlify environment variables to your Render backend URL
// e.g.  VITE_API_URL=https://onepiece-daily-api.onrender.com
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
