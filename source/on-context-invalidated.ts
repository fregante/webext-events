type OptionsWithSignal = {signal?: AbortSignal};

class OnContextInvalidated {
	#timer: NodeJS.Timeout | undefined;
	readonly #controller = new AbortController();

	// Calling this will start the polling
	get signal() {
		if (this.#timer) {
			return this.#controller.signal;
		}

		this.#timer = setInterval(() => {
			if (wasContextInvalidated()) {
				this.#controller.abort();
				clearInterval(this.#timer);
			}
		}, 200);

		return this.#controller.signal;
	}

	get promise() {
		return new Promise<void>(resolve => {
			this.addListener(resolve);
		});
	}

	/**
	 *
	 * @param callback         The function to call when the context is invalidated
	 * @param options.signal   The signal to remove the listener, like with the regular `addEventListener()`
	 */
	addListener(callback: VoidCallback, {signal}: OptionsWithSignal = {}): void {
		if (this.signal.aborted && !signal?.aborted) {
			setTimeout(callback, 0);
			return;
		}

		this.signal.addEventListener('abort', callback, {once: true, signal});
	}
}

export const onContextInvalidated = new OnContextInvalidated();
export const wasContextInvalidated = () => !chrome.runtime?.id;

// This is done to ensure each listener and abortsignal are independent in each test
export const _testing = OnContextInvalidated;
