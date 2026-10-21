type OptionsWithSignal = {signal?: AbortSignal};

class OnContextInvalidated {
	#timer: ReturnType<typeof setInterval> | undefined;
	readonly #controller = new AbortController();

	// Calling this will start the polling
	get signal() {
		if (this.#timer !== undefined) {
			return this.#controller.signal;
		}

		this.#timer = setInterval(() => {
			if (!wasContextInvalidated()) {
				return;
			}

			this.#controller.abort();
			clearInterval(this.#timer);
		}, 200);

		return this.#controller.signal;
	}

	get promise() {
		return new Promise<void>(resolve => {
			this.addListener(resolve);
		});
	}

	/**
	Call the callback when the context is invalidated.

	@param callback The function to call when the context is invalidated
	@param options Optional settings
	@param options.signal The signal to remove the listener, like with the regular `addEventListener()`
	*/
	addListener(callback: VoidCallback, options: OptionsWithSignal = {}): void {
		const {signal} = options;
		if (this.signal.aborted && !signal?.aborted) {
			setTimeout(callback, 0);
			return;
		}

		this.signal.addEventListener('abort', callback, {once: true, signal});
	}
}

export const onContextInvalidated = new OnContextInvalidated();
export const wasContextInvalidated = () => chrome.runtime?.id === undefined;

// This is done to ensure each listener and abortsignal are independent in each test
export const _testing = OnContextInvalidated;
