
import chrome from 'sinon-chrome';
import {describe, it, vi, expect, beforeEach} from 'vitest';
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
