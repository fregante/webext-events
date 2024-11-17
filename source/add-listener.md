# add-listener

Utility method to add listeners to events and remove them when the signal is aborted.

Currently this **requires** a `signal`. Without a `signal`, you should just use the native `addListener` method as this has no advantages over it.

```js
import {addListener} from 'webext-events';

addListener(chrome.tabs.onCreated, (tab) => {
	console.log('Hurray, a new tab was created')
}, {signal: AbortSignal.timeout(1000)});
```

> [!NOTE]
> Background workers are unloaded and the status of `signal`s created within them is reset. Dealing with this is outside the responsibility of this library.

## Compatibility

- Any browser

## Permissions

- No special permissions

## Context

- Any context

## Related

- [abort-utils](https://github.com/fregante/abort-utils) - Utility functions to use and combine `AbortSignal` and `AbortController` with Promises.

## [Main page ⏎](../readme.md)
