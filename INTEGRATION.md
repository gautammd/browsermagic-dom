# Integrating BrowserMagic DOM

This guide explains how to integrate the BrowserMagic DOM library into your applications.

## Integration with BrowserMagic Extension

### Option 1: Direct Import

The easiest way to integrate with the extension is to import the library directly:

```javascript
// In content.js
import { takeSnapshot } from 'browsermagic-dom';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fastSnapshot') {
    const snapshot = takeSnapshot({
      captureOutOfViewport: message.includeOffscreen || true
    });
    sendResponse({ success: true, snapshot });
  }
  return true; // Indicate async response
});
```

### Option 2: Update Existing DOM Utils

You can update the existing `dom-utils.js` file to use BrowserMagic DOM internally:

```javascript
// In dom-utils.js
import { takeSnapshot as browserMagicTakeSnapshot } from 'browsermagic-dom';

/**
 * Performance-optimized fast snapshot of key elements on the page
 * @param {Object} options - Options for the snapshot
 * @returns {Object} - Snapshot object with key elements and page information
 */
export function fastSnapshot(options = {}) {
  // Use BrowserMagic DOM library internally
  const snapshot = browserMagicTakeSnapshot({
    includeTitle: options.includeTitle,
    includeMetadata: options.includeMetadata,
    captureOutOfViewport: options.captureOutOfViewport !== false,
    elementFilter: options.elementFilter
  });
  
  // Keep backward compatibility with any expected format changes
  return snapshot;
}
```

## Integration with Other JavaScript Applications

### Browser Applications

```javascript
import { takeSnapshot } from 'browsermagic-dom';

// Add a button to create a snapshot
document.getElementById('captureBtn').addEventListener('click', () => {
  const snapshot = takeSnapshot();
  console.log(`Captured ${snapshot.keyElements.length} elements`);
  
  // You can send this to your server or process locally
  fetch('/api/analyze-page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snapshot)
  });
});
```

### Node.js Applications

Although the library is designed for browsers, you can use it with browser automation tools like Puppeteer:

```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function capturePage(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  
  // Inject and run BrowserMagic DOM in the page
  const browserMagicDomPath = path.join(__dirname, 'node_modules/browsermagic-dom/browsermagic-dom.js');
  const browserMagicDomCode = fs.readFileSync(browserMagicDomPath, 'utf8');
  
  // Inject as ES module
  await page.addScriptTag({ content: browserMagicDomCode, type: 'module' });
  
  // Take snapshot
  const snapshot = await page.evaluate(() => {
    return window.browserMagicDom.takeSnapshot();
  });
  
  await browser.close();
  return snapshot;
}
```

## Integration with AI Agents

The BrowserMagic DOM library is particularly useful for AI agents that need to understand and interact with web pages:

```javascript
import { takeSnapshot, findElementByXPath } from 'browsermagic-dom';

class BrowserAIAgent {
  constructor() {
    this.currentSnapshot = null;
  }
  
  async analyzePage() {
    // Capture the current page state
    this.currentSnapshot = takeSnapshot();
    
    // Convert to a format suitable for the AI model
    const pageContext = {
      url: this.currentSnapshot.url,
      title: this.currentSnapshot.title,
      elements: this.currentSnapshot.keyElements.map(el => ({
        type: el.tag,
        text: el.text,
        visible: el.inViewport,
        xpath: el.xpath
      }))
    };
    
    // Send to AI model for analysis
    const aiResponse = await this.sendToAI(pageContext);
    
    // Execute AI commands
    return this.executeCommands(aiResponse.commands);
  }
  
  async executeCommands(commands) {
    for (const command of commands) {
      if (command.action === 'click' && command.xpath) {
        const element = findElementByXPath(command.xpath);
        if (element) element.click();
      }
      // Handle other command types...
    }
  }
  
  async sendToAI(pageContext) {
    // Send page context to AI model and get response
    // Implementation depends on your AI service
    // ...
  }
}
```

## Performance Considerations

For very large pages, consider using these optimizations:

1. Filter elements by type:
   ```javascript
   takeSnapshot({ elementFilter: ['a', 'button', 'input'] })
   ```

2. Only capture viewport elements:
   ```javascript
   takeSnapshot({ captureOutOfViewport: false })
   ```

3. Skip metadata for faster processing:
   ```javascript
   takeSnapshot({ includeMetadata: false })
   ```

4. Limit position information:
   ```javascript
   takeSnapshot({ includePosition: false })
   ```

## Customizing for Specific Applications

The library is designed to be extensible. You can create custom wrappers for specific use cases:

```javascript
// E-commerce specific wrapper
function captureEcommerceElements() {
  return takeSnapshot({
    elementFilter: ['button', 'a', 'img', 'form'],
    textTruncateLength: 100
  });
}

// Form-focused wrapper
function captureFormElements() {
  const snapshot = takeSnapshot({
    elementFilter: ['input', 'select', 'textarea', 'button', 'label']
  });
  
  // Extract just the form-related elements
  return {
    url: snapshot.url,
    forms: snapshot.keyElements.filter(el => 
      el.tag === 'form' || 
      el.tag === 'input' || 
      el.tag === 'select' || 
      el.tag === 'textarea'
    )
  };
}
```