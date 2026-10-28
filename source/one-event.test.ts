import assert from 'node:assert/strict';
import {describe, it, beforeEach} from 'node:test';
import {chrome} from 'jest-chrome';
import {expectTypeOf} from 'expect-type';
import type {Cookies, Runtime} from 'jest-chrome/types/jest-chrome.js';
import oneEvent from './one-event.ts';
import {isPending} from './testing-utils.ts';

function helloFromTheOtherSide(greeting = 'hello') {
	chrome.runtime.onMessage.callListeners(
		{greeting}, // Message
		{}, // MessageSender object
		() => {}, // SendResponse function
	);
}

describe('oneEvent', () => {
	beforeEach(() => {
		chrome.runtime.onMessage.clearListeners();
	});

	it('it should resolve when an event is received', async () => {
		assert.equal(chrome.runtime.onMessage.hasListeners(), false);

		const eventPromise = oneEvent(chrome.runtime.onMessage);
		assert.equal(chrome.runtime.onMessage.hasListeners(), true);

		assert.equal(await isPending(eventPromise), true);

		helloFromTheOtherSide();

		assert.equal(await isPending(eventPromise), false);
	});

	it('it should resolve when a specific event is received', async () => {
		assert.equal(chrome.runtime.onMessage.hasListeners(), false);
		const eventPromise = oneEvent(
			chrome.runtime.onMessage, {
				filter: ({greeting}) => greeting === 'sup',
			},
		);
		assert.equal(chrome.runtime.onMessage.hasListeners(), true);

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

		const onMessage = oneEvent(chrome.runtime.onMessage, {
			filter(message, sender, sendResponse) {
				expectTypeOf(message).toEqualTypeOf<any>();
				expectTypeOf(sender).toEqualTypeOf<Runtime.MessageSender>();
				expectTypeOf(sendResponse).toEqualTypeOf<(response?: any) => void>();
				return true;
			},
		});

		expectTypeOf(onMessage).toEqualTypeOf<Promise<[any, Runtime.MessageSender, (response?: any) => void] | void>>();

		const onChanged = oneEvent(chrome.cookies.onChanged, {
			filter(changeInfo) {
				expectTypeOf(changeInfo).toEqualTypeOf<Cookies.CookieChangeInfo>();
				return true;
			},
		});

		expectTypeOf(onChanged).toEqualTypeOf<Promise<[Cookies.CookieChangeInfo] | void>>();
	});
});
