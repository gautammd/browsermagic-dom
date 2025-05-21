/**
 * BrowserMagic DOM Core
 * 
 * Essential core functions for DOM manipulation and analysis
 * 
 * @version 1.0.0
 * @license MIT
 */

/**
 * Generate an XPath for a DOM element
 * @param {Element} element - The DOM element to generate XPath for
 * @returns {string} - XPath expression for the element
 */
export function getXPath(element) {
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
 * Find an element in the DOM using its XPath
 * @param {string} xpath - XPath to the element
 * @returns {Element|null} - Found element or null if not found
 */
export function findElementByXPath(xpath) {
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
 * Take a snapshot of key elements on the page
 * @param {Object} [options={}] - Options for the snapshot
 * @returns {Object} - Snapshot with page and element information
 */
export function takeSnapshot(options = {}) {
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
    elements: []
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
        const isInViewport = (
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.right > 0
        );
        
        if (!captureOutOfViewport && !isInViewport) return;
        
        // Get visible text content
        let visibleText = '';
        if (el.nodeType === Node.TEXT_NODE) {
          visibleText = el.textContent;
        } else {
          for (let child of el.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
              visibleText += child.textContent;
            }
          }
        }
        
        visibleText = visibleText.replace(/\s+/g, ' ').trim().slice(0, textTruncateLength);
        
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
          
          // Add basic attributes
          const attributes = {};
          if (el.id) attributes.id = el.id;
          if (el.className) attributes.class = el.className;
          if (el.getAttribute('name')) attributes.name = el.getAttribute('name');
          if (el.getAttribute('role')) attributes.role = el.getAttribute('role');
          
          // Add element-specific attributes
          const tagName = el.tagName.toLowerCase();
          switch (tagName) {
            case 'a':
              if (el.href) attributes.href = el.href;
              break;
            case 'input':
              if (el.type) attributes.type = el.type;
              if (el.placeholder) attributes.placeholder = el.placeholder;
              if (el.value) attributes.value = el.value;
              break;
            case 'img':
              if (el.alt) attributes.alt = el.alt;
              if (el.src) attributes.src = el.src;
              break;
          }
          
          elementSnapshot.attributes = attributes;
          
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
    if ((includeShadowDOM && el instanceof ShadowRoot) || el instanceof Document) {
      for (let child of el.children) scan(child);
    }
  }
  
  // Start scanning from document body
  scan(document.body);
  
  // Add element snapshots to the main snapshot
  snapshot.elements = results;
  
  return snapshot;
}