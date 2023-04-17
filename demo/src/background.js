import {onExtensionStart} from 'webext-events';

console.log('Background worker started');

onExtensionStart.addListener(() => {
	console.trace('Extension started at', new Date());
});
