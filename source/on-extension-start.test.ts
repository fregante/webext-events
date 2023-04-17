
import chrome from 'sinon-chrome';
import {test, vi, assert} from 'vitest';
import {onExtensionStart} from './on-extension-start.js';

test('onExtensionStart', () => {
	const listenerSpy = vi.fn();
	const listenerSpy2 = vi.fn();
	onExtensionStart.addListener(listenerSpy);
	onExtensionStart.addListener(listenerSpy);
	onExtensionStart.addListener(listenerSpy2);
	assert.ok(chrome.runtime.onStartup.addListener.calledThrice, 'the internal listener should have been registered thrice (natively deduplicated)');

	onExtensionStart.removeListener(() => {}); // Unrelated
	onExtensionStart.removeListener(listenerSpy);
	assert.ok(chrome.runtime.onStartup.removeListener.notCalled, 'the internal listener should not have been unregistered yet');

	onExtensionStart.removeListener(listenerSpy2);
	assert.ok(chrome.runtime.onStartup.removeListener.calledOnce, 'the internal listener should have been unregistered');
});
