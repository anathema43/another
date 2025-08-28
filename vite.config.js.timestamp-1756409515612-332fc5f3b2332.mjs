// vite.config.js
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import svgr from "file:///home/project/node_modules/vite-plugin-svgr/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    svgr(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/storage"],
          ui: ["@heroicons/react", "react-router-dom"],
          // Feature-based chunks
          admin: [
            "./src/pages/Admin.jsx",
            "./src/pages/Orders.jsx",
            "./src/components/AdminRoute.jsx"
          ],
          artisans: [
            "./src/pages/ArtisansDirectory.jsx",
            "./src/pages/ArtisanProfile.jsx",
            "./src/store/artisanStore.js"
          ],
          checkout: [
            "./src/pages/Checkout.jsx",
            "./src/components/RazorpayCheckout.jsx",
            "./src/services/razorpayService.js"
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1e3,
    sourcemap: true
  },
  optimizeDeps: {
    include: ["react", "react-dom", "firebase/app", "firebase/auth", "firebase/firestore"],
    exclude: []
  },
  server: {
    port: 5173,
    open: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHN2Z3IoKSxcbiAgICByZWFjdCgpXG4gIF0sXG4gIGJ1aWxkOiB7XG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIC8vIFZlbmRvciBjaHVua3NcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgZmlyZWJhc2U6IFsnZmlyZWJhc2UvYXBwJywgJ2ZpcmViYXNlL2F1dGgnLCAnZmlyZWJhc2UvZmlyZXN0b3JlJywgJ2ZpcmViYXNlL3N0b3JhZ2UnXSxcbiAgICAgICAgICB1aTogWydAaGVyb2ljb25zL3JlYWN0JywgJ3JlYWN0LXJvdXRlci1kb20nXSxcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBGZWF0dXJlLWJhc2VkIGNodW5rc1xuICAgICAgICAgIGFkbWluOiBbXG4gICAgICAgICAgICAnLi9zcmMvcGFnZXMvQWRtaW4uanN4JyxcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9PcmRlcnMuanN4JyxcbiAgICAgICAgICAgICcuL3NyYy9jb21wb25lbnRzL0FkbWluUm91dGUuanN4J1xuICAgICAgICAgIF0sXG4gICAgICAgICAgYXJ0aXNhbnM6IFtcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9BcnRpc2Fuc0RpcmVjdG9yeS5qc3gnLFxuICAgICAgICAgICAgJy4vc3JjL3BhZ2VzL0FydGlzYW5Qcm9maWxlLmpzeCcsXG4gICAgICAgICAgICAnLi9zcmMvc3RvcmUvYXJ0aXNhblN0b3JlLmpzJ1xuICAgICAgICAgIF0sXG4gICAgICAgICAgY2hlY2tvdXQ6IFtcbiAgICAgICAgICAgICcuL3NyYy9wYWdlcy9DaGVja291dC5qc3gnLFxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvUmF6b3JwYXlDaGVja291dC5qc3gnLFxuICAgICAgICAgICAgJy4vc3JjL3NlcnZpY2VzL3Jhem9ycGF5U2VydmljZS5qcydcbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogMTAwMCxcbiAgICBzb3VyY2VtYXA6IHRydWVcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAnZmlyZWJhc2UvYXBwJywgJ2ZpcmViYXNlL2F1dGgnLCAnZmlyZWJhc2UvZmlyZXN0b3JlJ10sXG4gICAgZXhjbHVkZTogW11cbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBvcGVuOiB0cnVlLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFFakIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLFVBQVUsQ0FBQyxnQkFBZ0IsaUJBQWlCLHNCQUFzQixrQkFBa0I7QUFBQSxVQUNwRixJQUFJLENBQUMsb0JBQW9CLGtCQUFrQjtBQUFBO0FBQUEsVUFHM0MsT0FBTztBQUFBLFlBQ0w7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLFVBQVU7QUFBQSxZQUNSO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxVQUNGO0FBQUEsVUFDQSxVQUFVO0FBQUEsWUFDUjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsdUJBQXVCO0FBQUEsSUFDdkIsV0FBVztBQUFBLEVBQ2I7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxTQUFTLGFBQWEsZ0JBQWdCLGlCQUFpQixvQkFBb0I7QUFBQSxJQUNyRixTQUFTLENBQUM7QUFBQSxFQUNaO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
