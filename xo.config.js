import globals from 'globals';

/**
@type {import('xo').FlatXoConfig}
*/
const xoConfig = [
	{
		ignores: ['source/demo/package.json'],
	},
	{
		// Demo imports the package by its own name via `paths`
		files: ['source/demo/**'],
		rules: {
			'import-x/no-extraneous-dependencies': 'off',
		},
	},
	{
		// Mocks (`vi.fn()`, `sinon`) return values in void callbacks
		files: ['source/**/*.test.ts'],
		rules: {
			'@typescript-eslint/strict-void-return': 'off',
			// `test-utils.ts` is a helper, not a test file
			'node-test/no-import-test-files': 'off',
		},
	},
	{
		languageOptions: {
			globals: {
				...globals.browser,
				chrome: 'readonly',
			},
		},
		rules: {
			'@typescript-eslint/no-empty-function': 'off',
		},
	},
];

export default xoConfig;
