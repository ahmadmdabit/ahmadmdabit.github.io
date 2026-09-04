import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      input: {
        main: './index.html',     // Original entry
        '404': './404.html',      // Add 404 as second entry
      },
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
        chunkFileNames: 'assets/scripts/chunks/[name].[hash].js',
        entryFileNames: 'assets/scripts/entries/[name].[hash].js',
        assetFileNames: (assetInfo: { name?: string }) => {
          const name = assetInfo.name || '';
          if (/\.(woff2?|ttf|eot)$/i.test(name)) {
            return 'assets/fonts/[name].[hash].[ext]';
          }
          if (/\.css$/i.test(name)) {
            return 'assets/styles/[name].[hash].[ext]';
          }
          return 'assets/imgs/[name].[hash].[ext]';
        },
      }
    }
  }
});
