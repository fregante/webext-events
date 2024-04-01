/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import {onExtensionStart, oneEvent} from 'webext-events';

console.log('Background worker started');

onExtensionStart.addListener(() => {
	console.trace('Extension started at', new Date());
});

oneEvent(chrome.tabs.onCreated).then(() => {
	console.log('Tab created');
});

oneEvent(chrome.tabs.onMoved, {
	filter(tabId, moveInfo) {
		console.log('Should handle event?', {tabId, moveInfo});
		return Boolean(tabId % 5);
	}}).then(() => {
	console.log('Tab moved');
});

const httpsOnlyFilter = (tab: chrome.tabs.Tab) => Boolean(tab.pendingUrl?.startsWith('https'));
oneEvent(
	chrome.tabs.onCreated, {
		filter: httpsOnlyFilter,
	},
).then(() => {
	console.log('HTTPS Tab created');
});
