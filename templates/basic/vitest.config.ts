import { setupTestingBoxels } from 'boxels-config';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
        environment: 'jsdom',
		setupFiles: [setupTestingBoxels, 'setup.ts'],
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		css: true,
	},
});
