// eslint-disable-next-line n/file-extension-in-import -- Uses `export` Map
import {defineConfig} from 'vitest/config';

export default defineConfig({
	test: {
		include: ['**/*.test.ts'],
		setupFiles: [
			'./vitest.setup.js',
		],
	},
});
