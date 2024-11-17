import {
	describe, it, vi, expect,
} from 'vitest';
import {addListener} from './add-listener.js';

describe('addListener', () => {
	it('should remove the listener when the signal is aborted', () => {
		const event = {
			addListener: vi.fn(),
			removeListener: vi.fn(),
		};
		const listener = vi.fn();
		const controller = new AbortController();
		addListener(event, listener, {signal: controller.signal});

		expect(event.addListener).toHaveBeenCalledWith(listener);

		controller.abort();

		expect(event.removeListener).toHaveBeenCalledWith(listener);
	});
});

