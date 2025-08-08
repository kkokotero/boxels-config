import { defineConfig } from 'boxels-config';

export default defineConfig({
	root: 'src',
	publicDir: '../public',
	build: {
		input: 'src/index.html',
	},
});
