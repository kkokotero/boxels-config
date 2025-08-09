import { logger } from '@utils/logger';
import { resolve } from 'node:path';
import type { UserConfig } from 'vite';

import tsconfigPaths from 'vite-tsconfig-paths';

export interface BoxelsUserConfig extends UserConfig {
	server?: UserConfig['server'] & {
		/** Enable SPA fallback for history-based routing */
		historyApiFallback?: boolean;
	};
}

const rootDir = process.cwd();

export const standardConfig: BoxelsUserConfig = {
	root: rootDir,
	cacheDir: resolve(rootDir, '.boxels'),
	publicDir: resolve(rootDir, 'public'),

	esbuild: {
		jsx: 'automatic',
		jsxImportSource: 'boxels',
	},

	server: {
		port: 2468,
		open: false,
		strictPort: true,
		historyApiFallback: true,
		hmr: true,
		cors: true,
	},

	preview: {
		port: 4321,
		open: false,
	},

	optimizeDeps: {
		include: [],
		exclude: [],
	},

	build: {
		target: 'esnext',
		outDir: resolve(rootDir, 'dist'),
		emptyOutDir: true,
		minify: 'esbuild',
		cssMinify: 'esbuild',
		cssCodeSplit: true,
		chunkSizeWarningLimit: 200,
		rollupOptions: {
			jsx: {
				jsxImportSource: 'boxels',
			},

			input: {
				main: resolve(rootDir, 'index.html'),
			},
		},
	},

	css: {
		modules: {
			localsConvention: 'camelCaseOnly', 
			generateScopedName: '[name]__[local]__[hash:base64:5]',
		},
		preprocessorOptions: {
			scss: {
				additionalData: `
@use "sass:color";
@use "sass:list";
@use "sass:map";
@use "sass:math";
@use "sass:meta";
@use "sass:selector";
@use "sass:string";`,
			},
		},
	},

	logLevel: 'silent',

	plugins: [tsconfigPaths()],
	appType: 'spa',
};
