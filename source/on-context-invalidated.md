# onContextInvalidated

When an extension is disabled, restarted or updated, some contexts are left behind, specifically any content scripts in open tabs and any `*-extension://` pages open in iframes (such as the options page).

These contexts however no longer have access to the messaging and storage APIs, among others, so you get awkward "context invalidated" errors.

You can use this listener to gracefully disable the context and inform the user if necessary.

```js
import {onContextInvalidated} from 'webext-events';

async function listener() {
	console.log('Extension was updated, turned off or reloaded');
}

onContextInvalidated.addListener(listener);
// or
await onContextInvalidated.promise;
// or
fetch('/api', {signal: onContextInvalidated.signal})
```

## Compatibility

- Browser: any browser
- Manifest: MV2, MV3

## Permissions

- none

## Context

- any context

Some contexts like the background page/worker and standalone tabs will be closed by the browser automatically so the event doesn't apply there.

## [Main page ⏎](../readme.md)
