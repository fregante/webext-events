# webext-events [![][badge-gzip]][link-bundlephobia]

[badge-gzip]: https://img.shields.io/bundlephobia/minzip/webext-events.svg?label=gzipped
[link-bundlephobia]: https://bundlephobia.com/result?p=webext-events

> High-level events and utilities for events in Web Extensions

## Install

```sh
npm install webext-events
```

Or download the [standalone bundle](https://bundle.fregante.com/?pkg=webext-events&name=webextEvents) to include in your `manifest.json`.

## Usage

This package (will) export various utilities, just import what you need.

### onExtensionStart

Not to be confused with `chrome.runtime.onStartup`, this event is actually called when _the extension_ starts. The native `onStartup` is not fired when the user manually disables and re-enables the extension.

In event pages and service workers, the background file is loaded and unloaded automatically; This event will ensure that the specified listener is only ever run once per "extension start."

Compatibility:

- Chrome: 112+ (MV3 only)
- Safari: 16.4
- Firefox: no

Permissions:

- `storage` (due to [`chrome.storage.session`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session) usage)

Context:

- background worker
- background page
- event page

```js
import {onExtensionStart} from 'webext-events';

async function listener() {
	await chrome.storage.local.set({started: Date.now()})
}

onExtensionStart.addListener(listener);
```

## Related

- [webext-tools](https://github.com/fregante/webext-tools) - Utility functions for Web Extensions.
- [webext-content-scripts](https://github.com/fregante/webext-content-scripts) - Utility functions to inject content scripts in WebExtensions.
- [webext-detect-page](https://github.com/fregante/webext-detect-page) - Detects where the current browser extension code is being run.
- [webext-base-css](https://github.com/fregante/webext-base-css) - Extremely minimal stylesheet/setup for Web Extensions’ options pages (also dark mode)
- [webext-options-sync](https://github.com/fregante/webext-options-sync) - Helps you manage and autosave your extension's options.
- [More…](https://github.com/fregante/webext-fun)

## License

MIT © [Federico Brigante](https://fregante.com)
