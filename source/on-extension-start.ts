const storageKey = '__webext-events__startup';
const event = new EventTarget();
let hasRun = false;
let hasListeners = false;

async function runner() {
	hasRun = true;

	if (!hasListeners) {
		return;
	}

	const storage = await chrome.storage.session.get(storageKey);
	if (storageKey in storage) {
		return;
	}

	await chrome.storage.session.set({[storageKey]: true});
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
