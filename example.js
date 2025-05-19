/**
 * BrowserMagic DOM - Usage examples
 */

// Import the library
import { 
  takeSnapshot, 
  getXPath, 
  findElementByXPath, 
  visualizeSnapshot 
} from './browsermagic-dom.js';

// Example 1: Basic snapshot with default options
function basicExample() {
  const snapshot = takeSnapshot();
  console.log('Captured', snapshot.keyElements.length, 'elements');
  console.log('Page URL:', snapshot.url);
  console.log('Page title:', snapshot.title);
  
  // Example of working with captured elements
  snapshot.keyElements.forEach(element => {
    if (element.tag === 'button' && element.inViewport) {
      console.log('Found button in viewport:', element.text, 'at', element.xpath);
    }
  });
  
  return snapshot;
}

// Example 2: Custom snapshot options
function customExample() {
  // Only capture links and buttons
  const snapshot = takeSnapshot({
    elementFilter: ['a', 'button'],
    captureOutOfViewport: true,      // Include elements outside viewport (default)
    textTruncateLength: 100,         // Capture more text
    includeMetadata: false           // Skip metadata for performance
  });
  
  console.log('Captured', snapshot.keyElements.length, 'links and buttons');
  console.log('Elements outside viewport:', snapshot.keyElements.filter(el => !el.inViewport).length);
  
  return snapshot;
}

// Example 3: Finding and interacting with elements
function interactExample() {
  // First take a snapshot
  const snapshot = takeSnapshot();
  
  // Find the first button element
  const buttonElement = snapshot.keyElements.find(el => el.tag === 'button');
  
  if (buttonElement) {
    // Use the XPath to get the actual DOM element
    const domElement = findElementByXPath(buttonElement.xpath);
    
    if (domElement) {
      console.log('Found button:', buttonElement.text);
      // Could interact with it like:
      // domElement.click();
    }
  }
}

// Example 4: Create a visual representation of a snapshot
function visualizeExample() {
  const snapshot = takeSnapshot();
  const html = visualizeSnapshot(snapshot);
  
  // In a real application, you might:
  // - Save this to a file (in Node.js)
  // - Display in a modal or new window (in browser)
  // - Send to a debugging endpoint
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window (when run in browser)
  if (typeof window !== 'undefined') {
    window.open(url);
  }
  
  return url;
}

// Example 5: Usage in a Chrome extension content script
function extensionExample() {
  // This would be in your content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getPageSnapshot') {
      // Get options from the message
      const options = message.options || {};
      
      // Take the snapshot
      const snapshot = takeSnapshot({
        captureOutOfViewport: options.includeOffscreen !== false,
        elementFilter: options.elementTypes || null
      });
      
      // Send back to background/popup
      sendResponse({ 
        success: true, 
        snapshot,
        elementCount: snapshot.keyElements.length
      });
    }
    return true; // Indicate async response
  });
}

// Run examples
export function runExamples() {
  console.log('--- BrowserMagic DOM Basic Example ---');
  const basicSnapshot = basicExample();
  
  console.log('\n--- BrowserMagic DOM Custom Example ---');
  const customSnapshot = customExample();
  
  console.log('\n--- BrowserMagic DOM Interaction Example ---');
  interactExample();
  
  console.log('\n--- BrowserMagic DOM Visualization Example ---');
  const visualizationUrl = visualizeExample();
  
  return {
    basicSnapshot,
    customSnapshot,
    visualizationUrl
  };
}