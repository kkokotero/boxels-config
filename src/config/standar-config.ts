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

const cssData = `
@use "sass:color";
@use "sass:list";
@use "sass:map";
@use "sass:math";
@use "sass:meta";
@use "sass:selector";
@use "sass:string";
`;

export const standardConfig: BoxelsUserConfig = {
	root: rootDir,
	cacheDir: resolve(process.cwd(), '.boxels'),

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
		rollupOptions: {
			input: {
				main: resolve(rootDir, 'index.html'),
			},
		},
	},

	css: {
		modules: {
			localsConvention: 'camelCaseOnly',
			generateScopedName:
				process.env.NODE_ENV === 'production'
					? '[hash:base64:8]'
					: '_[name]_[local]_[hash:base64:5]',
		},
		preprocessorOptions: {
			scss: {
				additionalData: cssData,
			},
		},
	},

	logLevel: 'silent',

	plugins: [tsconfigPaths()],
	appType: 'spa',
};
