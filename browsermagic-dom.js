/**
 * BrowserMagic DOM Library
 * 
 * A lightweight, performance-optimized library for capturing DOM element information
 * in web applications. Works in both regular browser and extension contexts.
 * 
 * @version 1.0.0
 * @license MIT
 */

/**
 * Default configuration options for DOM snapshots
 * @typedef {Object} SnapshotOptions
 * @property {boolean} [includeTitle=true] - Whether to include document title
 * @property {boolean} [includeMetadata=true] - Whether to include meta tags
 * @property {boolean} [includeViewportInfo=true] - Whether to include viewport dimensions
 * @property {boolean} [captureOutOfViewport=true] - Whether to capture elements outside viewport
 * @property {boolean} [includePosition=true] - Whether to include element position information
 * @property {boolean} [includeShadowDOM=true] - Whether to traverse shadow DOM
 * @property {string[]} [elementFilter] - Optional list of tag names to focus on
 * @property {number} [textTruncateLength=60] - Maximum length of text content to capture
 */

/**
 * Element Snapshot
 * @typedef {Object} ElementSnapshot
 * @property {string} tag - Element's tag name
 * @property {string} xpath - XPath to the element
 * @property {string} text - Visible text content
 * @property {number} x - X coordinate relative to viewport
 * @property {number} y - Y coordinate relative to viewport
 * @property {number} width - Element width
 * @property {number} height - Element height
 * @property {boolean} inViewport - Whether element is in the viewport
 */

/**
 * Page Snapshot
 * @typedef {Object} PageSnapshot
 * @property {string} url - Current page URL
 * @property {string} timestamp - ISO timestamp when snapshot was taken
 * @property {string} [title] - Page title (if includeTitle is true)
 * @property {Object} [metadata] - Page metadata (if includeMetadata is true)
 * @property {Object} [viewport] - Viewport dimensions (if includeViewportInfo is true)
 * @property {ElementSnapshot[]} keyElements - Captured DOM elements information
 */

/**
 * Generate an XPath for a DOM element
 * @param {Element} element - The DOM element to generate XPath for
 * @returns {string} - XPath expression for the element
 */
function getXPath(element) {
  // Create a fully qualified XPath that always starts from the document root
  if (!element) return '';
  
  // Special case for the document
  if (element === document) return '';
  
  // Special case for the HTML element
  if (element === document.documentElement) return '/html';
  
  // Special case for the document body
  if (element === document.body) return '/html/body';
  
  // Build the full path from the element up to the document root
  let path = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    // Get all siblings of the same node type
    let siblings = Array.from(
      current.parentNode.childNodes
    ).filter(node => 
      node.nodeType === Node.ELEMENT_NODE && 
      node.tagName === current.tagName
    );
    
    // If there's only one element of this type, simplify the path
    if (siblings.length === 1) {
      path.unshift(current.tagName.toLowerCase());
    } else {
      // Element has siblings of the same type, find its index
      let index = 1; // XPath indices start at 1
      let sibling = current;
      
      // Count preceding siblings with the same node name
      while (sibling = sibling.previousElementSibling) {
        if (sibling.tagName === current.tagName) {
          index++;
        }
      }
      
      path.unshift(`${current.tagName.toLowerCase()}[${index}]`);
    }
    
    current = current.parentNode;
    
    // Stop when we reach the document
    if (current === document) break;
  }
  
  // Create the full XPath string starting from root
  return '/' + path.join('/');
}

/**
 * Get visible text content of an element
 * @param {Node} node - The node to extract text from
 * @returns {string} - Visible text content
 */
function getVisibleText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (!(node instanceof Element)) return '';
  
  // Check computed style for visibility
  try {
    const st = getComputedStyle(node);
    if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return '';
  } catch (e) {
    // Fail silently if we can't get the computed style
    return '';
  }
  
  // Recursively get text from all child nodes
  let text = '';
  for (let child of node.childNodes) text += getVisibleText(child);
  return text;
}

/**
 * Check if an element is in the viewport
 * @param {Object} rect - Element's bounding rect {x, y, width, height}
 * @returns {boolean} - Whether the element is in the viewport
 */
function inViewport({x, y, width, height}) {
  return (
    x + width > 0 &&
    y + height > 0 &&
    x < (window.innerWidth || document.documentElement.clientWidth) &&
    y < (window.innerHeight || document.documentElement.clientHeight)
  );
}

/**
 * Check if an element is visible
 * @param {Element} element - DOM element to check
 * @returns {boolean} - Whether the element is visible
 */
function isElementVisible(element) {
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
 * Take a snapshot of key elements on the page
 * @param {SnapshotOptions} [options={}] - Options for the snapshot
 * @returns {PageSnapshot} - Snapshot object with key elements and page information
 */
function takeSnapshot(options = {}) {
  const { 
    includeTitle = true, 
    includeMetadata = true,
    includeViewportInfo = true,
    captureOutOfViewport = true,
    includePosition = true,
    includeShadowDOM = true,
    elementFilter = null,
    textTruncateLength = 60
  } = options;
  
  // Create snapshot object with basic information
  const snapshot = {
    url: window.location.href,
    timestamp: new Date().toISOString(),
    keyElements: []
  };
  
  // Add title if requested
  if (includeTitle) {
    snapshot.title = document.title;
  }
  
  // Add metadata if requested
  if (includeMetadata) {
    const metadata = {};
    
    // Extract common metadata
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property');
      const content = tag.getAttribute('content');
      if (name && content) {
        metadata[name] = content;
      }
    });
    
    snapshot.metadata = metadata;
  }
  
  // Get viewport information if requested
  if (includeViewportInfo) {
    snapshot.viewport = {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight,
      scrollX: window.scrollX || window.pageXOffset,
      scrollY: window.scrollY || window.pageYOffset
    };
  }
  
  // Define relevant element types for optimized scanning
  const RELEVANT = elementFilter ? 
    new Set(elementFilter.map(tag => tag.toUpperCase())) : 
    new Set([
      'BUTTON', 'A', 'INPUT', 'LABEL', 'SELECT', 'TEXTAREA', 'IMG', 'SVG',
      'DIV', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P'
    ]);
  
  // Results container
  const results = [];
  
  /**
   * Recursive function to scan the DOM tree
   * @param {Node} el - The current node to scan
   */
  function scan(el) {
    // Skip non-element nodes, documents, and shadow roots
    if (!(el instanceof Element || el instanceof Document || el instanceof ShadowRoot)) return;
    
    // Traverse shadow DOM if requested
    if (includeShadowDOM && el.shadowRoot) scan(el.shadowRoot);
    
    // Process element nodes
    if (el instanceof Element) {
      try {
        // Skip invisible elements
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity) === 0) return;
        
        // Get element dimensions
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        
        // Skip elements outside viewport if not capturing those
        const isInViewport = inViewport(rect);
        if (!captureOutOfViewport && !isInViewport) return;
        
        // Get visible text content
        let visibleText = getVisibleText(el)
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, textTruncateLength);
        
        // Include element if it's relevant or has text content
        if (RELEVANT.has(el.tagName) || (visibleText && visibleText.length > 0)) {
          // Create element snapshot
          const elementSnapshot = {
            tag: el.tagName.toLowerCase(),
            xpath: getXPath(el),
            text: visibleText,
            inViewport: isInViewport
          };
          
          // Add position information if requested
          if (includePosition) {
            elementSnapshot.x = Math.round(rect.x);
            elementSnapshot.y = Math.round(rect.y);
            elementSnapshot.width = Math.round(rect.width);
            elementSnapshot.height = Math.round(rect.height);
          }
          
          // Add element to results
          results.push(elementSnapshot);
        }
      } catch (e) {
        // Skip element if there's an error processing it
        console.error('Error processing element:', e);
      }
      
      // Recursively process child elements
      for (let child of el.children) scan(child);
    }
    
    // Process document and shadow root nodes
    if (el instanceof ShadowRoot || el instanceof Document) {
      for (let child of el.children) scan(child);
    }
  }
  
  // Start scanning from document body
  scan(document.body);
  
  // Add element snapshots to the main snapshot
  snapshot.keyElements = results;
  
  return snapshot;
}

/**
 * Find an element in the DOM using its XPath
 * @param {string} xpath - XPath to the element
 * @returns {Element|null} - Found element or null if not found
 */
function findElementByXPath(xpath) {
  try {
    const result = document.evaluate(
      xpath, 
      document, 
      null, 
      XPathResult.FIRST_ORDERED_NODE_TYPE, 
      null
    );
    
    return result.singleNodeValue;
  } catch (e) {
    console.error('Error evaluating XPath:', e);
    return null;
  }
}

/**
 * Convert a page snapshot to a simplified format
 * @param {PageSnapshot} snapshot - The page snapshot to convert
 * @returns {Object} - Simplified page context object
 */
function snapshotToPageContext(snapshot) {
  return {
    url: snapshot.url,
    title: snapshot.title,
    elements: snapshot.keyElements.map(el => {
      return {
        xpath: el.xpath,
        text: el.text,
        type: el.tag,
        location: el.x !== undefined ? {
          x: el.x,
          y: el.y, 
          width: el.width,
          height: el.height
        } : undefined,
        inViewport: el.inViewport
      };
    }),
    timestamp: snapshot.timestamp
  };
}

/**
 * Create a visual representation of a snapshot for debugging
 * @param {PageSnapshot} snapshot - The page snapshot
 * @returns {string} - HTML string representing the snapshot
 */
function visualizeSnapshot(snapshot) {
  const html = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>BrowserMagic DOM: ${snapshot.title || snapshot.url}</title>`,
    '  <style>',
    '    body { font-family: system-ui, sans-serif; padding: 20px; }',
    '    .element { margin-bottom: 10px; padding: 10px; border: 1px solid #eee; }',
    '    .element:hover { background-color: #f5f5f5; }',
    '    .in-viewport { border-left: 4px solid green; }',
    '    .tag { color: #0066cc; font-weight: bold; }',
    '    .text { color: #333; }',
    '    .xpath { color: #666; font-family: monospace; font-size: 0.9em; }',
    '    .position { color: #999; font-size: 0.9em; }',
    '    .info { margin-top: 10px; padding: 10px; background: #f0f0f0; }',
    '  </style>',
    '</head>',
    '<body>',
    `  <h1>BrowserMagic DOM Snapshot: ${snapshot.title || snapshot.url}</h1>`,
    '  <div class="info">',
    `    <p>URL: ${snapshot.url}</p>`,
    `    <p>Timestamp: ${snapshot.timestamp}</p>`,
    `    <p>Elements: ${snapshot.keyElements.length}</p>`,
    `    <p>Viewport: ${snapshot.viewport ? `${snapshot.viewport.width}x${snapshot.viewport.height}` : 'Not captured'}</p>`,
    '  </div>',
    '  <h2>Elements</h2>'
  ];
  
  snapshot.keyElements.forEach(el => {
    html.push('  <div class="element' + (el.inViewport ? ' in-viewport' : '') + '">');
    html.push(`    <div><span class="tag">&lt;${el.tag}&gt;</span> <span class="text">${el.text || '(no text)'}</span></div>`);
    html.push(`    <div class="xpath">${el.xpath}</div>`);
    if (el.x !== undefined) {
      html.push(`    <div class="position">Position: x=${el.x}, y=${el.y}, width=${el.width}, height=${el.height}</div>`);
    }
    html.push(`    <div>${el.inViewport ? 'In viewport' : 'Outside viewport'}</div>`);
    html.push('  </div>');
  });
  
  html.push('</body>');
  html.push('</html>');
  
  return html.join('\n');
}

// Export public API
export {
  takeSnapshot,
  getXPath,
  findElementByXPath,
  inViewport,
  isElementVisible,
  getVisibleText,
  snapshotToPageContext,
  visualizeSnapshot
};

// Support both ES modules and CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    takeSnapshot,
    getXPath,
    findElementByXPath,
    inViewport,
    isElementVisible,
    getVisibleText,
    snapshotToPageContext,
    visualizeSnapshot
  };
}