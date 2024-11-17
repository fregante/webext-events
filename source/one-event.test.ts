import {chrome} from 'jest-chrome';
import {
	describe, it, vi, expect, beforeEach, expectTypeOf,
} from 'vitest';
import {type Cookies, type Runtime} from 'jest-chrome/types/jest-chrome.js';
import {oneEvent} from './one-event.js';

function helloFromTheOtherSide(greeting = 'hello') {
	chrome.runtime.onMessage.callListeners(
		{greeting}, // Message
		{}, // MessageSender object
		vi.fn(), // SendResponse function
	);
}

describe('oneEvent', () => {
	beforeEach(() => {
		chrome.runtime.onMessage.clearListeners();
	});

	it('it should resolve when an event is received', async () => {
		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);

		const eventPromise = oneEvent(chrome.runtime.onMessage);
		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

		await expect(eventPromise).toBePending();

		helloFromTheOtherSide();

		await expect(eventPromise).not.toBePending();
	});

	it('it should resolve when a specific event is received', async () => {
		expect(chrome.runtime.onMessage.hasListeners()).toBe(false);
		const eventPromise = oneEvent(
			chrome.runtime.onMessage, {
				filter: ({greeting}) => greeting === 'sup',
			},
		);
		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

		helloFromTheOtherSide();

		await expect(eventPromise).toBePending();

		helloFromTheOtherSide('sup');

		await expect(eventPromise).not.toBePending();
	});

	it('it should resolve original event\'s parameters', () => {
		const onMoved = oneEvent(chrome.tabs.onMoved, {
			filter(tabId, moveInfo) {
				expectTypeOf(tabId).toEqualTypeOf<number>();
				expectTypeOf(moveInfo).toEqualTypeOf<chrome.tabs.TabMoveInfo>();
				return true;
			},
		});

		expectTypeOf(onMoved).toEqualTypeOf<Promise<[number, chrome.tabs.TabMoveInfo] | void>>();

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
