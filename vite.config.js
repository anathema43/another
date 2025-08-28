import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  plugins: [
    svgr(),
    react()
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          ui: ['@heroicons/react', 'react-router-dom'],
          
          // Feature-based chunks
          admin: [
            './src/pages/Admin.jsx',
            './src/pages/Orders.jsx',
            './src/components/AdminRoute.jsx'
          ],
          artisans: [
            './src/pages/ArtisansDirectory.jsx',
            './src/pages/ArtisanProfile.jsx',
            './src/store/artisanStore.js'
          ],
          checkout: [
            './src/pages/Checkout.jsx',
            './src/components/RazorpayCheckout.jsx',
            './src/services/razorpayService.js'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore'],
    exclude: []
  },
  server: {
    port: 5173,
    open: true,
  },
});
