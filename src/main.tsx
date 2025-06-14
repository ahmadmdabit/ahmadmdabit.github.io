import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css'
import App from './App.tsx'
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

const cache = createCache({ key: 'css', prepend: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CacheProvider value={cache}>
      <App />
    </CacheProvider>
  </StrictMode>,
)
