class OnContextInvalidated {
	#timer: NodeJS.Timer | undefined;
	#controller = new AbortController();

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

	addListener(callback: VoidCallback) {
		if (this.signal.aborted) {
			setTimeout(callback, 0);
			return;
		}

		this.signal.addEventListener('abort', callback);
	}
}

export const onContextInvalidated = new OnContextInvalidated();
export const wasContextInvalidated = () => !chrome.runtime?.id;

// This is done to ensure each listener and abortsignal are independent in each test
export const _testing = OnContextInvalidated;
