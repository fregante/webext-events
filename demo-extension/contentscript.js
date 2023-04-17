import Sandbox from 'webext-events';

const sandbox = new Sandbox({
	// Optional
	url: chrome.runtime.getURL('sandbox.html'),
});

// Called automatically later, but you can preload it this way
sandbox.load();

sandbox.postMessage({
	type: 'PING',
}).then(response => {
	console.log({response}); // {response: 'pong'}
});

sandbox.postMessage({
	type: 'SOME_UNSAFE_CALL',
	payload: {
		any: 'serializable',
		content: [1, 'is supported'],
	},
}).then(response => {
	console.log({response}); // {response: 'your response'}
});
