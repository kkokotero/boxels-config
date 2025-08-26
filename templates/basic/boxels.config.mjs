import { defineConfig } from 'boxels-config';
import { resolve } from 'node:path';
import { boxComponentPlugin } from 'boxels/plugins';

export default defineConfig({
	root: 'src',
	publicDir: resolve(process.cwd(), 'public'),
	build: {
		input: 'src/index.html',
	},
	plugins: [boxComponentPlugin],
});
