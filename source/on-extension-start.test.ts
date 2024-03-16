
import chrome from 'sinon-chrome';
import {describe, it, vi, expect, beforeEach} from 'vitest';

const getMock = vi.fn().mockResolvedValue({});

const sleep = async (ms: number) => new Promise(resolve => {
	setTimeout(resolve, ms);
});

// @ts-expect-error - sinon-chrome hasn't been updated to support the new storage API
chrome.storage.session = {
	get: getMock,
	set: vi.fn(),
};

// `onExtensionStart` has global state
beforeEach(() => {
	vi.resetModules();
});

describe('onExtensionStart', () => {
	it('should register and run the listeners', async () => {
		const {onExtensionStart} = await import('./on-extension-start.js');

		getMock.mockResolvedValue({});

		const listenerSpy = vi.fn();
		const listenerSpy2 = vi.fn();

		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy2);

		await sleep(100);

		expect(listenerSpy).toHaveBeenCalledTimes(1);
		expect(listenerSpy2).toHaveBeenCalledTimes(1);
	});

	it('should not run the listeners after the registration time window has closed', async () => {
		const {onExtensionStart} = await import('./on-extension-start.js');

		const listenerSpy = vi.fn();
		const listenerSpy2 = vi.fn();

		await sleep(200);

		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy2);

		await sleep(100);

		expect(listenerSpy).toHaveBeenCalledTimes(0);
		expect(listenerSpy2).toHaveBeenCalledTimes(0);
	});

	it('should not run the listeners if they are removed', async () => {
		const {onExtensionStart} = await import('./on-extension-start.js');

		const listenerSpy = vi.fn();
		const listenerSpy2 = vi.fn();

		onExtensionStart.addListener(listenerSpy);
		onExtensionStart.addListener(listenerSpy2);

		onExtensionStart.removeListener(listenerSpy);

		await sleep(100);

		expect(listenerSpy).toHaveBeenCalledTimes(0);
		expect(listenerSpy2).toHaveBeenCalledTimes(1);
	});
});
