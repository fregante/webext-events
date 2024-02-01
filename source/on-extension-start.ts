import {isChrome, isPersistentBackgroundPage} from 'webext-detect-page';

const storageKey = '__webext-events__startup';
const event = new EventTarget();
let hasRun = false;
let hasListeners = false;

// @ts-expect-error No need to load `browser` types yet
const browserStorage = globalThis.browser?.storage as typeof chrome.storage ?? globalThis.chrome?.storage;

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

	if (!browserStorage?.session) {
		if (isChrome() && chrome.runtime.getManifest().manifest_version === 2) {
			console.warn('onExtensionStart is unable to determine whether it’s being run for the first time on MV2 Event Pages in Chrome. It will run the listeners anyway.');
		} else {
			console.warn('onExtensionStart is unable to determine whether it’s being run for the first time without the `storage` permission. It will run the listeners anyway');
		}

		event.dispatchEvent(new Event('extension-start'));
		return;
	}

	const storage = await browserStorage.session.get(storageKey);
	if (storageKey in storage) {
		return;
	}

	await browserStorage.session.set({[storageKey]: true});
	event.dispatchEvent(new Event('extension-start'));
}

export const onExtensionStart = Object.freeze({
	addListener(callback: VoidCallback) {
		if (hasRun) {
			console.warn('onExtensionStart.addListener() was called after the extension started. The callback will not be called.');
		} else {
			hasListeners = true;
			event.addEventListener('extension-start', callback);
		}
	},
});

// Automatically register the runner
setTimeout(runner, 100);
