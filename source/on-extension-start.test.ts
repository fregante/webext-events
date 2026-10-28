import {
	describe,
	it,
	beforeEach,
	type TestContext,
} from 'node:test';
import chrome from 'sinon-chrome';
import type onExtensionStartType from './on-extension-start.ts';

const sleep = async (ms: number) => new Promise(resolve => {
	setTimeout(resolve, ms);
});

beforeEach(() => {
	// @ts-expect-error - sinon-chrome hasn't been updated to support the new storage API
	chrome.storage.session = {
		get: async () => ({}),
		set() {},
	};
});

// `onExtensionStart` has global state, so each test needs a fresh module
let importCount = 0;
const importFresh = async () => (await import(`./on-extension-start.ts?${importCount++}`)) as {default: typeof onExtensionStartType};

describe('onExtensionStart', () => {
	it('should register and run the listeners', async (t: TestContext) => {
		const {default: onExtensionStart} = await importFresh();

		const listenerSpy = t.mock.fn();
		const listenerSpy2 = t.mock.fn();

		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy2);

		await sleep(100);

		t.assert.strictEqual(listenerSpy.mock.callCount(), 1);
		t.assert.strictEqual(listenerSpy2.mock.callCount(), 1);
	});

	it('should not run the listeners after the registration time window has closed', async (t: TestContext) => {
		const {default: onExtensionStart} = await importFresh();

		const listenerSpy = t.mock.fn();
		const listenerSpy2 = t.mock.fn();

		await sleep(200);

		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy2);

		await sleep(100);

		t.assert.strictEqual(listenerSpy.mock.callCount(), 0);
		t.assert.strictEqual(listenerSpy2.mock.callCount(), 0);
	});

	it('should not run the listeners if they are removed', async (t: TestContext) => {
		const {default: onExtensionStart} = await importFresh();

		const listenerSpy = t.mock.fn();
		const listenerSpy2 = t.mock.fn();

		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy2);

		onExtensionStart.removeListener(listenerSpy);

		await sleep(100);

		t.assert.strictEqual(listenerSpy.mock.callCount(), 0);
		t.assert.strictEqual(listenerSpy2.mock.callCount(), 1);
	});
});
