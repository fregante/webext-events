import {onExtensionStart} from 'webext-events';

console.log('Background worker started');

onExtensionStart.addListener(() => {
	console.log('Extension started at', new Date());
});
