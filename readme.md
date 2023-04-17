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

Compatibility:

- Chrome: 112+ (MV3 only)
- Safari: 16.4
- Firefox: no

Permissions:

- `storage` (due to [`chrome.storage.session`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/session) usage)

Context:

- background

```js
import {onExtensionStart} from 'webext-events';

async function listener() {
	await chrome.storage.local.set({started: Date.now()})
}

onExtensionStart.addListener(listener);

// It can also be removed
onExtensionStart.removeListener(listener);
```

## License

MIT © [Federico Brigante](https://fregante.com)
