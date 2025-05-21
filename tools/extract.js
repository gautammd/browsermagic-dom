/**
 * BrowserMagic DOM - Extract Tool
 * 
 * DOM element extraction tool that finds elements and extracts data
 * based on queries (CSS selectors, XPath, or text patterns).
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
  isElementVisible,
  getVisibleText,
  getPageMetadata,
  getViewportInfo
} from './utils.js';

/**
 * Extract elements and data from the DOM
 * 
 * @param {string} query - CSS selector, XPath, or text pattern
 * @param {Object} [options] - Extraction options
 * @param {string} [options.queryType="css"] - Query type: "css", "xpath", or "text"
 * @param {boolean} [options.visible=true] - Only return visible elements
 * @param {boolean} [options.inViewport=false] - Only return elements in viewport
 * @param {number} [options.limit=50] - Maximum number of results to return
 * @param {Object} [options.extract] - What to extract from elements
 * @param {boolean} [options.extract.text=true] - Extract text content
 * @param {boolean} [options.extract.html=false] - Extract HTML content
 * @param {string[]} [options.extract.attributes=[]] - Element attributes to extract
 * @param {string[]} [options.extract.styles=[]] - CSS properties to extract
 * @param {boolean} [options.extract.state=false] - Extract form element state
 * @returns {Object} Result with extracted elements data
 */
function elements(query, options = {}) {
  try {
    const {
      queryType = "css",
      visible = true,
      inViewport = false,
      limit = 50,
      extract = {
        text: true,
        html: false,
        attributes: [],
        styles: [],
        state: false
      }
    } = options;
    
    // Find elements based on query type
    let elements = [];
    
    switch (queryType.toLowerCase()) {
      case "css":
        elements = Array.from(document.querySelectorAll(query));
        break;
        
      case "xpath":
        const xpathResult = document.evaluate(
          query,
          document,
          null,
          XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        
        for (let i = 0; i < xpathResult.snapshotLength; i++) {
          elements.push(xpathResult.snapshotItem(i));
        }
        break;
        
      case "text":
        // This is a simplified implementation - for production,
        // you'd want more sophisticated text search
        const allElements = document.querySelectorAll('*');
        const lowerQuery = query.toLowerCase();
        
        elements = Array.from(allElements).filter(el => {
          const text = el.textContent || '';
          return text.toLowerCase().includes(lowerQuery);
        });
        break;
        
      default:
        throw new Error(`Invalid queryType: ${queryType}`);
    }
    
    // Filter elements based on options
    if (visible) {
      elements = elements.filter(isElementVisible);
    }
    
    if (inViewport) {
      elements = elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return (
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.right > 0
        );
      });
    }
    
    // Store total number before limiting
    const totalMatches = elements.length;
    
    // Limit number of results
    if (limit && elements.length > limit) {
      elements = elements.slice(0, limit);
    }
    
    // Extract requested data
    const results = elements.map(element => {
      // Get basic element info
      const result = {
        tag: element.tagName.toLowerCase(),
        xpath: getXPath(element),
      };
      
      // Extract text content
      if (extract.text) {
        result.text = getVisibleText(element).trim();
      }
      
      // Extract HTML content
      if (extract.html) {
        result.html = element.outerHTML;
      }
      
      // Extract position
      const rect = element.getBoundingClientRect();
      result.position = {
        x: Math.round(rect.left),
        y: Math.round(rect.top),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        inViewport: (
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth &&
          rect.bottom > 0 &&
          rect.right > 0
        )
      };
      
      // Extract requested attributes
      if (extract.attributes && extract.attributes.length > 0) {
        result.attributes = {};
        
        extract.attributes.forEach(attr => {
          if (element.hasAttribute(attr)) {
            result.attributes[attr] = element.getAttribute(attr);
          }
        });
        
        // Always include these core attributes if the element has them
        ['id', 'class', 'name', 'type', 'value', 'href', 'src', 'alt'].forEach(attr => {
          if (!result.attributes[attr] && element.hasAttribute(attr)) {
            result.attributes[attr] = element.getAttribute(attr);
          }
        });
      }
      
      // Extract requested styles
      if (extract.styles && extract.styles.length > 0) {
        result.styles = {};
        const computedStyle = window.getComputedStyle(element);
        
        extract.styles.forEach(prop => {
          result.styles[prop] = computedStyle.getPropertyValue(prop);
        });
      }
      
      // Extract form element state
      if (extract.state) {
        const tag = element.tagName.toLowerCase();
        
        if (tag === 'input' || tag === 'textarea' || tag === 'select') {
          result.state = {};
          
          // Common properties
          if ('disabled' in element) result.state.disabled = element.disabled;
          if ('readOnly' in element) result.state.readOnly = element.readOnly;
          if ('required' in element) result.state.required = element.required;
          
          // Input-specific properties
          if (tag === 'input') {
            const type = element.type;
            result.state.type = type;
            
            if (type === 'checkbox' || type === 'radio') {
              result.state.checked = element.checked;
              result.state.value = element.value;
            } else {
              result.state.value = element.value;
            }
          }
          
          // Select-specific properties
          if (tag === 'select') {
            result.state.multiple = element.multiple;
            result.state.selectedIndex = element.selectedIndex;
            
            if (element.multiple) {
              result.state.selectedValues = Array.from(element.selectedOptions)
                .map(option => option.value);
            } else {
              result.state.value = element.value;
              result.state.selectedOption = element.options[element.selectedIndex]?.text || null;
            }
            
            result.state.options = Array.from(element.options).map(option => ({
              value: option.value,
              text: option.text,
              selected: option.selected
            }));
          }
          
          // Textarea
          if (tag === 'textarea') {
            result.state.value = element.value;
          }
        }
      }
      
      return result;
    });
    
    return createSuccessResult({
      query,
      queryType,
      count: results.length,
      totalMatches,
      elements: results
    });
  } catch (error) {
    return createErrorResult(
      `Extraction failed: ${error.message}`,
      { query }
    );
  }
}

/**
 * Extract page metadata and context
 * 
 * @returns {Object} Result with page metadata
 */
function pageInfo() {
  try {
    // Get metadata
    const metadata = getPageMetadata();
    
    // Count elements by type
    const elementCounts = {};
    const elements = document.querySelectorAll('*');
    
    Array.from(elements).forEach(el => {
      const tag = el.tagName.toLowerCase();
      elementCounts[tag] = (elementCounts[tag] || 0) + 1;
    });
    
    // Get viewport and document sizes
    const { viewport, document: docInfo } = getViewportInfo();
    
    return createSuccessResult({
      url: window.location.href,
      title: document.title,
      metadata,
      elementCounts,
      viewport,
      document: docInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createErrorResult(`Failed to extract page info: ${error.message}`);
  }
}

// Export the Extract tool
export default {
  elements,
  pageInfo
};