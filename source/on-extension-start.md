# onExtensionStart

Not to be confused with `chrome.runtime.onStartup`, this event is actually called when _the extension_ starts. The native `onStartup` is not fired when the user manually disables and re-enables the extension.

In event pages and service workers, the background file is loaded and unloaded automatically; This event will ensure that the specified listener is only ever run once per "extension start."

```js
import {onExtensionStart} from 'webext-events';

async function listener() {
	console.log('Extension started now');
	await chrome.storage.local.set({started: Date.now()})
}

// Add the listener as soon as possible because the "onExtensionStart"
// event happens around 100ms after 'webext-events' is loaded
onExtensionStart.addListener(listener);
```

## Compatibility

- Chrome: 112+ (MV3 only)
- Safari: 16.4
- Firefox: no

## Permissions

- `storage` (due to [`chrome.storage.session`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session) usage)

## Context

- background worker
- background page
- event page
