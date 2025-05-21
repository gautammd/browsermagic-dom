/**
 * BrowserMagic DOM - Visualize Tool
 * 
 * Visualization tool that provides screenshots, accessibility tree,
 * and DOM structure visualization.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { 
  getXPath, 
  takeSnapshot
} from '../core.js';

import { 
  createSuccessResult, 
  createErrorResult,
  findElement,
  getElementInfo,
  isElementVisible,
  getViewportInfo
} from './utils.js';

/**
 * Take a screenshot of the page or element
 * 
 * Note: Real implementation would require browser extension API
 * or server-side rendering. This is a placeholder for the interface.
 * 
 * @param {Object} [options] - Screenshot options
 * @param {string} [options.element] - CSS selector for specific element
 * @param {boolean} [options.fullPage=false] - Capture entire page, not just viewport
 * @returns {Promise<Object>} Result with screenshot data
 */
async function screenshot(options = {}) {
  try {
    const { 
      element = null, 
      fullPage = false 
    } = options;
    
    // In a real implementation, this would use browser extension APIs
    // or communicate with a server to take the screenshot.
    // For this example, we'll return a descriptive placeholder.
    
    // If element is specified, find it
    let elementDetails = null;
    
    if (element) {
      const targetElement = findElement(element);
      
      if (!targetElement) {
        return createErrorResult(
          `Element not found: ${element}`,
          { options }
        );
      }
      
      // Get element details
      elementDetails = getElementInfo(targetElement, element);
    }
    
    // Get viewport info
    const { viewport } = getViewportInfo();
    
    return createSuccessResult({
      type: 'screenshot',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      fullPage,
      viewport,
      element: elementDetails,
      // In a real implementation, this would be base64-encoded image data
      imageData: '[Base64-encoded screenshot would be here in actual implementation]'
    });
  } catch (error) {
    return createErrorResult(
      `Screenshot failed: ${error.message}`,
      { options }
    );
  }
}

/**
 * Get accessibility tree information
 * 
 * @param {Object} [options] - Accessibility options
 * @param {string} [options.root] - CSS selector for tree root element
 * @param {number} [options.depth=3] - Maximum tree depth
 * @returns {Object} Result with accessibility tree
 */
function accessibilityTree(options = {}) {
  try {
    const { 
      root = 'body', 
      depth = 3 
    } = options;
    
    // Find root element
    const rootElement = findElement(root);
    
    if (!rootElement) {
      return createErrorResult(
        `Root element not found: ${root}`,
        { options }
      );
    }
    
    /**
     * Recursively build accessibility tree
     * @param {Element} element - Element to analyze
     * @param {number} currentDepth - Current depth in tree
     * @returns {Object} Element's accessibility information
     */
    function buildA11yNode(element, currentDepth) {
      if (currentDepth > depth) return null;
      
      // Get element role
      let role = element.getAttribute('role');
      
      // If no explicit role, infer from element type
      if (!role) {
        const tag = element.tagName.toLowerCase();
        
        // Simplified role mapping (a real implementation would be more comprehensive)
        const roleMap = {
          a: 'link',
          button: 'button',
          h1: 'heading',
          h2: 'heading',
          h3: 'heading',
          h4: 'heading',
          h5: 'heading',
          h6: 'heading',
          img: 'img',
          input: (() => {
            const type = element.getAttribute('type');
            if (type === 'checkbox') return 'checkbox';
            if (type === 'radio') return 'radio';
            if (type === 'button' || type === 'submit') return 'button';
            return 'textbox';
          })(),
          select: 'combobox',
          textarea: 'textbox',
          nav: 'navigation',
          main: 'main',
          header: 'banner',
          footer: 'contentinfo',
          form: 'form'
        };
        
        role = roleMap[tag] || '';
      }
      
      // Build node data
      const node = {
        tag: element.tagName.toLowerCase(),
        role: role || undefined,
        name: element.getAttribute('aria-label') || 
              element.getAttribute('alt') || 
              element.textContent?.trim().substring(0, 80) || 
              undefined,
        xpath: getXPath(element)
      };
      
      // Get ARIA attributes
      const ariaAttributes = {};
      for (const attr of element.attributes) {
        if (attr.name.startsWith('aria-')) {
          ariaAttributes[attr.name] = attr.value;
        }
      }
      
      if (Object.keys(ariaAttributes).length > 0) {
        node.ariaAttributes = ariaAttributes;
      }
      
      // Check states
      const states = [];
      if (element.hasAttribute('disabled')) states.push('disabled');
      if (element.hasAttribute('checked') || element.checked) states.push('checked');
      if (element.hasAttribute('required')) states.push('required');
      if (element.hasAttribute('expanded')) {
        states.push(element.getAttribute('expanded') === 'true' ? 'expanded' : 'collapsed');
      }
      
      if (states.length > 0) {
        node.states = states;
      }
      
      // Check visibility
      if (!isElementVisible(element)) {
        node.hidden = true;
      }
      
      // Get children recursively
      if (currentDepth < depth) {
        const children = Array.from(element.children)
          .map(child => buildA11yNode(child, currentDepth + 1))
          .filter(child => child !== null);
        
        if (children.length > 0) {
          node.children = children;
        }
      }
      
      return node;
    }
    
    // Build the accessibility tree
    const tree = buildA11yNode(rootElement, 1);
    
    return createSuccessResult({
      type: 'accessibilityTree',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      tree
    });
  } catch (error) {
    return createErrorResult(
      `Accessibility tree generation failed: ${error.message}`,
      { options }
    );
  }
}

/**
 * Get DOM structure visualization
 * 
 * @param {Object} [options] - DOM structure options
 * @param {string} [options.root='body'] - CSS selector for structure root
 * @param {number} [options.depth=5] - Maximum depth to traverse
 * @returns {Object} Result with DOM structure
 */
function domStructure(options = {}) {
  try {
    const { 
      root = 'body', 
      depth = 5 
    } = options;
    
    // Find root element
    const rootElement = findElement(root);
    
    if (!rootElement) {
      return createErrorResult(
        `Root element not found: ${root}`,
        { options }
      );
    }
    
    /**
     * Recursively build DOM structure
     * @param {Element} element - Element to analyze
     * @param {number} currentDepth - Current depth in tree
     * @returns {Object} Element's structure information
     */
    function buildDOMNode(element, currentDepth) {
      if (currentDepth > depth) return null;
      
      // Get element attributes
      const attributes = {};
      for (const attr of element.attributes) {
        // Limit attributes to common ones for readability
        if (['id', 'class', 'name', 'type', 'href', 'src', 'alt', 'role'].includes(attr.name)) {
          attributes[attr.name] = attr.value;
        }
      }
      
      // Build node data
      const node = {
        tag: element.tagName.toLowerCase(),
        xpath: getXPath(element)
      };
      
      // Only include attributes if there are any
      if (Object.keys(attributes).length > 0) {
        node.attributes = attributes;
      }
      
      // Include text for text-containing elements if it's not too long
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 100 && 
          !['script', 'style'].includes(node.tag)) {
        node.text = text;
      }
      
      // Get children recursively
      if (currentDepth < depth) {
        const children = Array.from(element.children)
          .map(child => buildDOMNode(child, currentDepth + 1))
          .filter(child => child !== null);
        
        if (children.length > 0) {
          node.children = children;
        }
      }
      
      return node;
    }
    
    // Build the DOM structure
    const structure = buildDOMNode(rootElement, 1);
    
    return createSuccessResult({
      type: 'domStructure',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      structure
    });
  } catch (error) {
    return createErrorResult(
      `DOM structure generation failed: ${error.message}`,
      { options }
    );
  }
}

/**
 * Get a detailed snapshot of the page
 * 
 * @param {Object} [options] - Snapshot options
 * @returns {Object} Result with page snapshot
 */
function snapshot(options = {}) {
  try {
    // Use the existing takeSnapshot function from core.js
    const pageSnapshot = takeSnapshot(options);
    
    return createSuccessResult({
      type: 'snapshot',
      timestamp: new Date().toISOString(),
      url: window.location.href,
      title: document.title,
      snapshot: pageSnapshot
    });
  } catch (error) {
    return createErrorResult(`Snapshot failed: ${error.message}`);
  }
}

// Export the Visualize tool
export default {
  screenshot,
  accessibilityTree,
  domStructure,
  snapshot
};