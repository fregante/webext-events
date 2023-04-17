import {chrome} from 'jest-chrome';
import {describe, it, vi, expect, beforeEach} from 'vitest';
import {oneEvent} from './one-event.js';

const sleep = async (ms: number) => new Promise(resolve => {
	setTimeout(resolve, ms, ms);
});

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace -- It is what it is
	namespace jest {
		// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- It is what it is
		interface Matchers<R> {
			toBePending(): Promise<R>;
		}
	}
}

expect.extend({
	async toBePending(promise: Promise<unknown>) {
		const result = await Promise.race([promise, sleep(10)]);
		if (result === 10) {
			return {
				message: () => 'Expected Promise to be pending.',
				pass: true,
			};
		}

		return {
			message: () => 'Expected Promise to be pending, but it resolved.',
			pass: false,
		};
	},
});

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
			chrome.runtime.onMessage,
			({greeting}) => greeting === 'sup',
		);
		expect(chrome.runtime.onMessage.hasListeners()).toBe(true);

		helloFromTheOtherSide();

		await expect(eventPromise).toBePending();

		helloFromTheOtherSide('sup');

		await expect(eventPromise).not.toBePending();
	});
});
