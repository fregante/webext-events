import {isChrome, isPersistentBackgroundPage} from 'webext-detect';

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

	if (isPersistentBackgroundPage()) {
		// It's certainly the first and only time
		event.dispatchEvent(new Event('extension-start'));
		return;
	}

	if (browserStorage?.session === undefined) {
		if (isChrome() && chrome.runtime.getManifest().manifest_version === 2) {
			console.warn('onExtensionStart is unable to determine whether it’s being run for the first time on MV2 Event Pages in Chrome. It will run the listeners anyway.');
		} else {
			console.warn('onExtensionStart is unable to determine whether it’s being run for the first time without the `storage` permission. It will run the listeners anyway');
		}

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
// eslint-disable-next-line unicorn/no-top-level-side-effects -- Must run on its own
setTimeout(runner, 2);
