import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
  server: {
    allowedHosts: ["f16ccf5333b7.ngrok-free.app"]
  }
});
