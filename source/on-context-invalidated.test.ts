
import chrome from 'sinon-chrome';
import {
	describe,
	it,
	vi,
	expect,
	beforeEach,
	afterEach,
} from 'vitest';
import {_testing as OnContextInvalidated, wasContextInvalidated} from './on-context-invalidated.js';
import {sleep} from './test-utils.js';

const unloadExtension = () => {
	// @ts-expect-error -- Types only
	delete chrome.runtime.id;
};

beforeEach(() => {
	chrome.runtime.id = 'my-lil-extension';
});

describe('wasContextInvalidated', () => {
	it('should be false when the extension is running', async () => {
		expect(wasContextInvalidated()).toBe(false);
	});
	it('should be true when the extension is unloaded', async () => {
		unloadExtension();
		expect(wasContextInvalidated()).toBe(true);
	});
});

describe('onContextInvalidated', () => {
	it('should register and run the listeners', async () => {
		const onContextInvalidated = new OnContextInvalidated();
		const listenerSpy = vi.fn();
		const listenerSpy2 = vi.fn();

		onContextInvalidated.addListener(listenerSpy);
		onContextInvalidated.addListener(listenerSpy);
		onContextInvalidated.addListener(listenerSpy2);

		unloadExtension();

		await sleep(300);

		expect(listenerSpy).toHaveBeenCalledTimes(1);
		expect(listenerSpy2).toHaveBeenCalledTimes(1);
	});

	it('should run the listeners added after the first event was dispatched', async () => {
		const onContextInvalidated = new OnContextInvalidated();
		const listenerSpy = vi.fn();
		onContextInvalidated.addListener(listenerSpy);

		unloadExtension();

		await sleep(300);
		expect(listenerSpy).toHaveBeenCalledTimes(1);

		const listenerSpy2 = vi.fn();
		onContextInvalidated.addListener(listenerSpy2);

		await sleep(100);
		expect(listenerSpy2).toHaveBeenCalledTimes(1);
	});
	it('should remove the listeners when the listener signal is aborted', async () => {
		const onContextInvalidated = new OnContextInvalidated();
		const listenerSpy = vi.fn();
		const listenerSpy2 = vi.fn();

		onContextInvalidated.addListener(listenerSpy);
		onContextInvalidated.addListener(listenerSpy2, {signal: AbortSignal.abort()});

		unloadExtension();

		await sleep(300);

		expect(listenerSpy).toHaveBeenCalledTimes(1);
		expect(listenerSpy2).not.toHaveBeenCalled();
	});
});

describe('onContextInvalidated.signal', () => {
	it('should be open at launch and become aborted after the unload', async () => {
		const onContextInvalidated = new OnContextInvalidated();
		expect(onContextInvalidated.signal.aborted).toBe(false);

		unloadExtension();
		await sleep(400);
		expect(onContextInvalidated.signal.aborted).toBe(true);
	});
});

describe('onContextInvalidated.promise', () => {
	it('should resolve after the unload', async () => {
		const onContextInvalidated = new OnContextInvalidated();

		await expect(onContextInvalidated.promise).toBePending();
		unloadExtension();
		await sleep(400);
		await expect(onContextInvalidated.promise).not.toBePending();
	});
});

describe('onContextInvalidated in Safari', () => {
	const getMock = vi.fn();

	beforeEach(() => {
		vi.useFakeTimers();
		vi.stubGlobal('navigator', {userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'});
		getMock.mockReset().mockResolvedValue({});
		vi.stubGlobal('chrome', {runtime: {id: 'my-lil-extension'}, storage: {local: {get: getMock}}});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.unstubAllGlobals();
	});

	it('should abort when `storage.local.get()` resolves to `undefined`, even if `runtime.id` is still set', async () => {
		const onContextInvalidated = new OnContextInvalidated();
		expect(onContextInvalidated.signal.aborted).toBe(false);

		await vi.advanceTimersByTimeAsync(1000);
		expect(onContextInvalidated.signal.aborted).toBe(false);

		getMock.mockResolvedValue(undefined);
		await vi.advanceTimersByTimeAsync(1000);
		expect(onContextInvalidated.signal.aborted).toBe(true);
	});

	it('should not abort without the `storage` permission', async () => {
		// Simulate the missing `storage` permission
		vi.stubGlobal('chrome', {runtime: {id: 'my-lil-extension'}});

		const onContextInvalidated = new OnContextInvalidated();
		expect(onContextInvalidated.signal.aborted).toBe(false);

		await vi.advanceTimersByTimeAsync(3000);
		expect(onContextInvalidated.signal.aborted).toBe(false);
	});
});
