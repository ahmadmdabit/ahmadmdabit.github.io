import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        // NOTE: manualChunks disabled for now. There is an issue related to it.
        // manualChunks: (id) => {
        //   if (id.includes('node_modules')) {
        //     const start = id.indexOf('node_modules');
        //     if (id.includes('react', start)) return 'react-vendor';
        //     if (id.includes('@mui', start) || id.includes('@emotion', start)) return 'mui-vendor';
        //     if (id.includes('i18next', start)) return 'i18n-vendor';
        //     return 'vendor';
        //   }
        // },
        chunkFileNames: 'chunks/[name].[hash].js',
        entryFileNames: 'entries/[name].[hash].js'
      }
    }
  }
});
