/**
 * BrowserMagic DOM - Shared Utilities
 * 
 * Common utility functions used by multiple tools
 * 
 * @version 1.0.0
 * @license MIT
 */

import { 
  findElementByXPath,
  getXPath
} from '../core.js';

/**
 * Standard result object structure used by all tools
 * @typedef {Object} ToolResult
 * @property {boolean} success - Whether the operation succeeded
 * @property {string} [error] - Error message if operation failed
 * @property {Object} [data] - Operation-specific result data
 */

/**
 * Creates a success result object
 * @param {Object} data - Result data
 * @returns {ToolResult} Success result
 */
export function createSuccessResult(data) {
  return {
    success: true,
    data
  };
}

/**
 * Creates an error result object
 * @param {string} message - Error message
 * @param {Object} [data] - Additional context data
 * @returns {ToolResult} Error result
 */
export function createErrorResult(message, data = {}) {
  return {
    success: false,
    error: message,
    data
  };
}

/**
 * Finds an element in the DOM using either CSS selector or XPath
 * @param {string} target - CSS selector or XPath to find element
 * @returns {Element|null} Found element or null
 */
export function findElement(target) {
  // Try as CSS selector
  let element = document.querySelector(target);
  
  // If not found, try as XPath
  if (!element) {
    try {
      element = findElementByXPath(target);
    } catch (e) {
      // Not an XPath either
    }
  }
  
  return element;
}

/**
 * Checks if an element is visible
 * @param {Element} element - DOM element to check
 * @returns {boolean} Whether the element is visible
 */
export function isElementVisible(element) {
  if (!element) return false;
  
  try {
    const style = window.getComputedStyle(element);
    
    // Check basic visibility
    if (style.display === 'none' || 
        style.visibility === 'hidden' || 
        style.opacity === '0') {
      return false;
    }
    
    // Check dimensions
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }
    
    return true;
  } catch (e) {
    // If we can't determine visibility, assume it's visible
    return true;
  }
}

/**
 * Check if an element is in the viewport
 * @param {Element} element - DOM element to check
 * @returns {boolean} Whether the element is in the viewport
 */
export function isInViewport(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  return (
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth &&
    rect.bottom > 0 &&
    rect.right > 0
  );
}

/**
 * Gets basic information about an element
 * @param {Element} element - DOM element
 * @param {string} [originalTarget] - The original selector/xpath used
 * @returns {Object} Element information
 */
export function getElementInfo(element, originalTarget = null) {
  if (!element) return null;
  
  const info = {
    tag: element.tagName.toLowerCase(),
    xpath: getXPath(element),
  };
  
  // Add original target if provided
  if (originalTarget) {
    info.target = originalTarget;
  }
  
  // Add text if element has it
  const text = element.textContent?.trim();
  if (text) {
    info.text = text.length > 80 ? `${text.substring(0, 80)}...` : text;
  }
  
  // Add position
  const rect = element.getBoundingClientRect();
  info.position = {
    x: Math.round(rect.left),
    y: Math.round(rect.top),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    inViewport: isInViewport(element)
  };
  
  return info;
}

/**
 * Creates a promise that resolves when page loads or times out
 * @param {Object} options - Loading options
 * @param {boolean} [options.waitForLoad=true] - Whether to wait for load event
 * @param {number} [options.timeout=30000] - Timeout in milliseconds
 * @returns {Promise<Object>} Promise that resolves when loading completes
 */
export function createLoadPromise(options = {}) {
  const { 
    waitForLoad = true,
    timeout = 30000
  } = options;
  
  return new Promise((resolve, reject) => {
    let timeoutId;
    
    // Set timeout
    if (timeout) {
      timeoutId = setTimeout(() => {
        window.removeEventListener('load', handleLoad);
        reject(new Error(`Loading timeout after ${timeout}ms`));
      }, timeout);
    }
    
    // Handle page load completion
    const handleLoad = () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      // Wait for any immediate post-load operations
      setTimeout(() => {
        resolve({
          url: window.location.href,
          title: document.title,
          timestamp: new Date().toISOString()
        });
      }, 500);
    };
    
    // Listen for load events
    if (waitForLoad) {
      window.addEventListener('load', handleLoad, { once: true });
    } else {
      // If not waiting for load, resolve after a short delay
      setTimeout(handleLoad, 300);
    }
  });
}

/**
 * Creates a promise that resolves when an element appears in the DOM
 * @param {string} selector - CSS selector to wait for
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<void>} Promise that resolves when element appears
 */
export function waitForElement(selector, timeout = 30000) {
  return new Promise((resolve, reject) => {
    // Check if element already exists
    if (document.querySelector(selector)) {
      return resolve();
    }
    
    let timeoutId;
    
    // Set timeout
    if (timeout) {
      timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element wait timeout after ${timeout}ms: ${selector}`));
      }, timeout);
    }
    
    // Set up mutation observer
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        if (timeoutId) clearTimeout(timeoutId);
        observer.disconnect();
        resolve();
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  });
}

/**
 * Get detailed metadata from the current page
 * @returns {Object} Page metadata
 */
export function getPageMetadata() {
  const metadata = {};
  
  // Extract metadata tags
  document.querySelectorAll('meta').forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property');
    const content = meta.getAttribute('content');
    
    if (name && content) {
      metadata[name] = content;
    }
  });
  
  return metadata;
}

/**
 * Get viewport and document dimensions
 * @returns {Object} Viewport and document information
 */
export function getViewportInfo() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const docWidth = Math.max(
    document.body.scrollWidth,
    document.documentElement.scrollWidth,
    document.body.offsetWidth,
    document.documentElement.offsetWidth,
    document.body.clientWidth,
    document.documentElement.clientWidth
  );
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight,
    document.body.clientHeight,
    document.documentElement.clientHeight
  );
  
  return {
    viewport: {
      width: windowWidth,
      height: windowHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    },
    document: {
      width: docWidth,
      height: docHeight
    }
  };
}

/**
 * Gets the visible text content of an element
 * @param {Element} element - The element to get text from
 * @returns {string} The visible text content
 */
export function getVisibleText(element) {
  if (!element) return '';
  
  if (element.nodeType === Node.TEXT_NODE) return element.textContent;
  if (!(element instanceof Element)) return '';
  
  // Check if element is visible
  if (!isElementVisible(element)) return '';
  
  // Recursively get text from all child nodes
  let text = '';
  for (const child of element.childNodes) {
    text += getVisibleText(child);
  }
  
  return text.replace(/\s+/g, ' ').trim();
}