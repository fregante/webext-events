/* eslint-disable @typescript-eslint/no-floating-promises -- `node:test` returns promises, fixed in a later xo */
import assert from 'node:assert/strict';
import {describe, it, beforeEach} from 'node:test';
import sinonChrome from 'sinon-chrome';
import {expectTypeOf} from 'expect-type';
import oneEvent from './one-event.ts';
import {isPending} from './testing-utils.ts';

const messageEvent = sinonChrome.runtime.onMessage as typeof sinonChrome.runtime.onMessage & typeof chrome.runtime.onMessage;

function helloFromTheOtherSide(greeting = 'hello') {
	messageEvent.trigger(
		{greeting}, // Message
		{}, // MessageSender object
		() => {}, // SendResponse function
	);
}

describe('oneEvent', () => {
	beforeEach(() => {
		messageEvent.removeListeners();
		messageEvent.addListener.resetHistory();
		messageEvent.removeListener.resetHistory();
	});

	it('it should resolve when an event is received', async () => {
		assert.equal(messageEvent.addListener.called, false);

		const eventPromise = oneEvent(messageEvent);
		assert.equal(messageEvent.addListener.calledOnce, true);

		assert.equal(await isPending(eventPromise), true);

		helloFromTheOtherSide();

		assert.equal(await isPending(eventPromise), false);
	});

	it('it should resolve when a specific event is received', async () => {
		assert.equal(messageEvent.addListener.called, false);
		const eventPromise = oneEvent(
			messageEvent, {
				filter: ({greeting}) => greeting === 'sup',
			},
		);
		assert.equal(messageEvent.addListener.calledOnce, true);

		helloFromTheOtherSide();

		assert.equal(await isPending(eventPromise), true);

		helloFromTheOtherSide('sup');

		assert.equal(await isPending(eventPromise), false);
	});

	// eslint-disable-next-line node-test/require-assertion -- Type-level test
	it('it should resolve original event\'s parameters', () => {
		const onMoved = oneEvent(chrome.tabs.onMoved, {
			filter(tabId, moveInfo) {
				expectTypeOf(tabId).toEqualTypeOf<number>();
				expectTypeOf(moveInfo).toEqualTypeOf<chrome.tabs.OnMovedInfo>();
				return true;
			},
		});

		expectTypeOf(onMoved).toEqualTypeOf<Promise<[number, chrome.tabs.OnMovedInfo] | void>>();

		const onMessagePromise = oneEvent(chrome.runtime.onMessage, {
			filter(message, sender, sendResponse) {
				expectTypeOf(message).toEqualTypeOf<any>();
				expectTypeOf(sender).toEqualTypeOf<chrome.runtime.MessageSender>();
				expectTypeOf(sendResponse).toEqualTypeOf<(response?: any) => void>();
				return true;
			},
		});

		expectTypeOf(onMessagePromise).toEqualTypeOf<Promise<[any, chrome.runtime.MessageSender, (response?: any) => void] | void>>();

		const onChanged = oneEvent(chrome.cookies.onChanged, {
			filter(changeInfo) {
				expectTypeOf(changeInfo).toEqualTypeOf<chrome.cookies.CookieChangeInfo>();
				return true;
			},
		});

		expectTypeOf(onChanged).toEqualTypeOf<Promise<[chrome.cookies.CookieChangeInfo] | void>>();
	});
});
