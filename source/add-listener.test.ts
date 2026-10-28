import {describe, it, type TestContext} from 'node:test';
import {expectTypeOf} from 'expect-type';
import addListener from './add-listener.js';

describe('addListener', () => {
	it('should remove the listener when the signal is aborted', (t: TestContext) => {
		const event = {
			addListener: t.mock.fn(),
			removeListener: t.mock.fn(),
		};
		const listener = t.mock.fn();
		const controller = new AbortController();
		addListener(event, listener, {signal: controller.signal});

		t.assert.deepStrictEqual(event.addListener.mock.calls[0]?.arguments, [listener]);

		controller.abort();

		t.assert.deepStrictEqual(event.removeListener.mock.calls[0]?.arguments, [listener]);
	});

	// eslint-disable-next-line node-test/require-assertion -- Type-level test
	it('should have the correct types', () => {
		addListener(chrome.tabs.onMoved, (tabId, tab) => {
			expectTypeOf(tabId).toEqualTypeOf<number>();
			expectTypeOf(tab).toEqualTypeOf<chrome.tabs.OnMovedInfo>();
		}, {signal: AbortSignal.timeout(1000)});
	});
});

