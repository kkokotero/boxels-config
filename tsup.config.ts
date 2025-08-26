import { defineConfig } from 'tsup';

export default defineConfig([
	{
		entry: ['src/**/*.ts'],
		outDir: 'dist',
		format: ['cjs'],
		cjsInterop: true,
		splitting: true,
		minify: true,
		dts: true,
		clean: true,
		platform: 'node',
		tsconfig: './tsconfig.json',
		target: 'es2022',
		shims: true,
		bundle: true,
		treeshake: true,
		external: [
			'vite',
			'util',
			'url',
			'events',
			'path',
			'fs',
			'assert',
			'stream',
			'constants',
			'readline',
			'module',
			'os',
			'inspector',
			'child_process',
			'tty',
		],
		onSuccess: 'chmod +x ./dist/index.cjs',
		outExtension({ format }) {
			if (format === 'cjs') return { js: '.cjs' };
			return { js: '.js' };
		},
	},
]);
