# BrowserMagic DOM

A lightweight, performance-optimized library for capturing DOM element information in web applications. Designed specifically for AI-powered browser automation. Works in both regular browser and extension contexts.

## Features

- Efficient DOM element capture with minimal performance impact
- Capture elements both in and outside the viewport
- Customizable filtering of elements
- XPath generation for reliable element location
- Shadow DOM traversal
- Compatible with both browser and extension environments
- No dependencies
- Support for both ES modules and CommonJS

## Installation

```bash
npm install browsermagic-dom
```

## Usage

### Basic Usage

```javascript
import { takeSnapshot } from 'browsermagic-dom';

// Take a snapshot with default options
const snapshot = takeSnapshot();
console.log(snapshot.keyElements.length);  // Number of elements captured
console.log(snapshot.url);                 // Current page URL
console.log(snapshot.title);               // Page title
```

### With Custom Options

```javascript
import { takeSnapshot } from 'browsermagic-dom';

// Take a snapshot with custom options
const snapshot = takeSnapshot({
  includeTitle: true,             // Include page title
  includeMetadata: true,          // Include meta tags
  includeViewportInfo: true,      // Include viewport dimensions
  captureOutOfViewport: true,     // Capture elements outside viewport
  includePosition: true,          // Include element position
  includeShadowDOM: true,         // Traverse Shadow DOM
  elementFilter: ['a', 'button'], // Only capture these elements
  textTruncateLength: 100         // Maximum text content length
});
```

### Find Elements by XPath

```javascript
import { findElementByXPath } from 'browsermagic-dom';

// Find an element using its XPath
const element = findElementByXPath('/html/body/div[1]/a[3]');
if (element) {
  element.click(); // Interact with the element
}
```

### Visualize Snapshot for Debugging

```javascript
import { takeSnapshot, visualizeSnapshot } from 'browsermagic-dom';

// Take a snapshot
const snapshot = takeSnapshot();

// Create an HTML visualization
const html = visualizeSnapshot(snapshot);

// Open in a new window
const win = window.open();
win.document.write(html);
win.document.close();
```

## API Reference

### `takeSnapshot(options)`

Takes a snapshot of the current DOM state.

#### Options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeTitle` | boolean | `true` | Whether to include document title |
| `includeMetadata` | boolean | `true` | Whether to include meta tags |
| `includeViewportInfo` | boolean | `true` | Whether to include viewport info |
| `captureOutOfViewport` | boolean | `true` | Whether to capture elements outside viewport |
| `includePosition` | boolean | `true` | Whether to include element position |
| `includeShadowDOM` | boolean | `true` | Whether to traverse Shadow DOM |
| `elementFilter` | string[] | `null` | List of tag names to capture (null = all relevant) |
| `textTruncateLength` | number | `60` | Maximum text content length |

#### Returns:

A `PageSnapshot` object containing:
- `url`: Current page URL
- `timestamp`: When the snapshot was taken
- `title`: Page title (if includeTitle is true)
- `metadata`: Meta tags (if includeMetadata is true)
- `viewport`: Viewport info (if includeViewportInfo is true)
- `keyElements`: Array of captured elements

### `getXPath(element)`

Generates an XPath expression for a DOM element.

### `findElementByXPath(xpath)`

Finds an element using an XPath expression.

### `inViewport(rect)`

Checks if an element is in the viewport.

### `isElementVisible(element)`

Checks if an element is visible (not hidden by CSS).

### `getVisibleText(node)`

Gets the visible text content of a node.

### `snapshotToPageContext(snapshot)`

Converts a snapshot to a simplified page context format.

### `visualizeSnapshot(snapshot)`

Creates an HTML visualization of a snapshot for debugging.

## Browser Compatibility

BrowserMagic DOM is compatible with all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Integration with BrowserMagic Extension

This library is designed to work seamlessly with the BrowserMagic browser extension. To use it in your extension:

```javascript
// In content.js
import { takeSnapshot } from 'browsermagic-dom';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getPageSnapshot') {
    const snapshot = takeSnapshot({
      captureOutOfViewport: message.includeOffscreen || true
    });
    sendResponse({ success: true, snapshot });
  }
  return true; // Indicate async response
});
```

## License

MIT