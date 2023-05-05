import {chrome} from 'jest-chrome';
import {describe, it, vi, expect, beforeEach} from 'vitest';
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
