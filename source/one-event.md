# oneEvent

Utility method to capture a single event and resolve a promise after it's received:

```js
import {oneEvent} from 'webext-events';

// Wait until the user opens a new tab
await oneEvent(chrome.tabs.onCreated);

console.log('Hurray, a new tab was created')
```

It also supports filtering:

```js
import {oneEvent} from 'webext-events';

// Wait until the user opens a new tab, but it has it be HTTPS
await oneEvent(chrome.tabs.onCreated, {
	filter: (tab) => tab.pendingUrl?.startsWith('https'),
});

console.log('Hurray, a new HTTPS tab was created')
```

And abort signals:

```js
import {oneEvent} from 'webext-events';

// Wait until the user opens a new tab, but only for one second
const timeout = AbortSignal.timeout(1000);
await oneEvent(chrome.tabs.onCreated, {
	signal: timeout,
});

if (timeout.aborted) {
	console.log('No tab was created in time')
} else {
	console.log('Hurray, a new tab was created')
}
```

## Compatibility

- Any browser

## Permissions

- No special permissions

## Context

- Any context

## Related

- [one-event](https://github.com/fregante/one-event) - The same thing, but for regular browser events.
