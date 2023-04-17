const storageKey = '__webext-events__startup';
const startListeners = new Set<VoidCallback>();
let hasRun = false;

async function runner() {
	const storage = await chrome.storage.session.get(storageKey);
	if (storageKey in storage) {
		return;
	}

	await chrome.storage.session.set({[storageKey]: true});
	hasRun = true;
	for (const callback of startListeners) {
		// Make sure that listeners don't break the chain
		// eslint-disable-next-line func-names -- Call stack helper
		setTimeout(function onExtensionStart() {
			callback();
		});
	}
}

export const onExtensionStart = {
	addListener(callback: VoidCallback) {
		if (hasRun) {
			console.warn('onExtensionStart.addListener() was called after the extension started. The callback will not be called.');
		} else {
			startListeners.add(callback);
		}
	},
};

// Automatically register the runner
setTimeout(runner, 100);
