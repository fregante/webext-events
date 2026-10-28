
import assert from 'node:assert/strict';
import {
	describe,
	it,
	beforeEach,
	type TestContext,
} from 'node:test';
import chrome from 'sinon-chrome';
import {_testing as OnContextInvalidated, wasContextInvalidated} from './on-context-invalidated.ts';
import {isPending, sleep} from './testing-utils.ts';

const unloadExtension = () => {
	// @ts-expect-error -- Types only
	delete chrome.runtime.id;
};

beforeEach(() => {
	chrome.runtime.id = 'my-lil-extension';
});

describe('wasContextInvalidated', () => {
	it('should be false when the extension is running', () => {
		assert.equal(wasContextInvalidated(), false);
	});
	it('should be true when the extension is unloaded', () => {
		unloadExtension();
		assert.equal(wasContextInvalidated(), true);
	});
});

describe('onContextInvalidated', () => {
	it('should register and run the listeners', async (t: TestContext) => {
		const onContextInvalidated = new OnContextInvalidated();
		const listenerSpy = t.mock.fn();
		const listenerSpy2 = t.mock.fn();

		onContextInvalidated.addListener(listenerSpy);
		onContextInvalidated.addListener(listenerSpy);
		onContextInvalidated.addListener(listenerSpy2);

		unloadExtension();

		await sleep(300);

		t.assert.strictEqual(listenerSpy.mock.callCount(), 1);
		t.assert.strictEqual(listenerSpy2.mock.callCount(), 1);
	});

	it('should run the listeners added after the first event was dispatched', async (t: TestContext) => {
		const onContextInvalidated = new OnContextInvalidated();
		const listenerSpy = t.mock.fn();
		onContextInvalidated.addListener(listenerSpy);

		unloadExtension();

		await sleep(300);
		t.assert.strictEqual(listenerSpy.mock.callCount(), 1);

		const listenerSpy2 = t.mock.fn();
		onContextInvalidated.addListener(listenerSpy2);

		await sleep(100);
		t.assert.strictEqual(listenerSpy2.mock.callCount(), 1);
	});
	it('should remove the listeners when the listener signal is aborted', async (t: TestContext) => {
		const onContextInvalidated = new OnContextInvalidated();
		const listenerSpy = t.mock.fn();
		const listenerSpy2 = t.mock.fn();

		onContextInvalidated.addListener(listenerSpy);
		onContextInvalidated.addListener(listenerSpy2, {signal: AbortSignal.abort()});

		unloadExtension();

		await sleep(300);

		t.assert.strictEqual(listenerSpy.mock.callCount(), 1);
		t.assert.strictEqual(listenerSpy2.mock.callCount(), 0);
	});
});

describe('onContextInvalidated.signal', () => {
	it('should be open at launch and become aborted after the unload', async () => {
		const onContextInvalidated = new OnContextInvalidated();
		assert.equal(onContextInvalidated.signal.aborted, false);

		unloadExtension();
		await sleep(400);
		assert.equal(onContextInvalidated.signal.aborted, true);
	});
});

describe('onContextInvalidated.promise', () => {
	it('should resolve after the unload', async () => {
		const onContextInvalidated = new OnContextInvalidated();

		assert.equal(await isPending(onContextInvalidated.promise), true);
		unloadExtension();
		await sleep(400);
		assert.equal(await isPending(onContextInvalidated.promise), false);
	});
});
