import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(), 
    tailwind({
      // Dòng này bắt buộc để Tailwind tự nhận style mà không cần file CSS riêng
      applyBaseStyles: true, 
    })
  ],
  output: 'server',
  adapter: vercel(),
});