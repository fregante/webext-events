const startListeners = new Set<VoidCallback>();
const storageKey = '__webext-events__startup';
async function onStartup() {
	const {[storageKey]: wasRegistered} = await chrome.storage.session.get(storageKey);
	if (wasRegistered) {
		return;
	}

	await chrome.storage.session.set({[storageKey]: true});
	for (const callback of startListeners) {
		callback();
	}
}

export const onExtensionStart = {addListener, removeListener};

function addListener(callback: VoidCallback) {
	startListeners.add(callback);
	chrome.runtime.onStartup.addListener(onStartup);
}

function removeListener(callback: VoidCallback) {
	startListeners.delete(callback);
	if (startListeners.size === 0) {
		chrome.runtime.onStartup.removeListener(onStartup);
	}
}
