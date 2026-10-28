const storageKey = '__webext-events__startup';
const event = new EventTarget();
let hasRun = false;
let hasListeners = false;

const browserStorage = globalThis.browser?.storage ?? globalThis.chrome?.storage;

async function runner() {
	hasRun = true;

	if (!hasListeners) {
		return;
	}

	if (browserStorage?.session === undefined) {
		console.warn('onExtensionStart is unable to determine whether it’s being run for the first time without the `storage` permission. It will run the listeners anyway');
		event.dispatchEvent(new Event('extension-start'));
		return;
	}

	const storage = await browserStorage.session.get(storageKey);
	if (Object.hasOwn(storage, storageKey)) {
		return;
	}

	await browserStorage.session.set({[storageKey]: true});
	event.dispatchEvent(new Event('extension-start'));
}

const onExtensionStart = Object.freeze({
	addListener(callback: VoidCallback) {
		if (hasRun) {
			console.warn('onExtensionStart.addListener() was called after the extension started. The callback will not be called.');
		} else {
			hasListeners = true;
			event.addEventListener('extension-start', callback);
		}
	},
	removeListener(callback: VoidCallback) {
		event.removeEventListener('extension-start', callback);
	},
});

export default onExtensionStart;

// Automatically register the runner
// eslint-disable-next-line unicorn/no-top-level-side-effects, @typescript-eslint/strict-void-return -- Must run on its own
setTimeout(runner, 2);
