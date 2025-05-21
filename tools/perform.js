/**
 * BrowserMagic DOM - Perform Tool
 * 
 * Action execution tool that performs user actions like clicking,
 * typing, selecting, and hovering on elements.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { 
  getXPath,
  findElementByXPath
} from '../core.js';

import { 
  createSuccessResult, 
  createErrorResult,
  findElement,
  getElementInfo,
  waitForElement
} from './utils.js';

/**
 * Click an element
 * 
 * @param {string} target - CSS selector or XPath of element to click
 * @param {Object} [options] - Click options
 * @param {boolean} [options.waitForNavigation=false] - Wait for resulting navigation
 * @param {string} [options.waitForSelector] - Wait for this selector to appear after click
 * @param {boolean} [options.rightClick=false] - Perform right-click instead of left-click
 * @param {number} [options.timeout=30000] - Timeout for waits in ms
 * @returns {Promise<Object>} Result of the click action
 */
async function click(target, options = {}) {
  try {
    const {
      waitForNavigation = false,
      waitForSelector = null,
      rightClick = false,
      timeout = 30000
    } = options;
    
    // Find element
    const element = findElement(target);
    
    if (!element) {
      return createErrorResult(
        `Target element not found: ${target}`,
        { target, options }
      );
    }
    
    // Get element information
    const elementInfo = getElementInfo(element, target);
    
    // Create promise for navigation or selector wait if requested
    let waitPromise = Promise.resolve();
    
    if (waitForNavigation) {
      waitPromise = new Promise((resolve, reject) => {
        const currentUrl = window.location.href;
        let timeoutId;
        
        // Set timeout
        if (timeout) {
          timeoutId = setTimeout(() => {
            window.removeEventListener('load', handleLoad);
            reject(new Error(`Navigation timeout after ${timeout}ms`));
          }, timeout);
        }
        
        // Handle load event
        const handleLoad = () => {
          if (timeoutId) clearTimeout(timeoutId);
          resolve();
        };
        
        window.addEventListener('load', handleLoad, { once: true });
      });
    } else if (waitForSelector) {
      waitPromise = waitForElement(waitForSelector, timeout);
    }
    
    // Perform the click action
    if (rightClick) {
      // Simulate right-click
      const event = new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        button: 2,
        buttons: 2
      });
      element.dispatchEvent(event);
    } else {
      // Regular click
      element.click();
    }
    
    // Wait for navigation or selector if requested
    try {
      await waitPromise;
    } catch (error) {
      return createErrorResult(
        error.message,
        {
          element: elementInfo,
          action: rightClick ? 'rightClick' : 'click',
          waitType: waitForNavigation ? 'navigation' : 'selector',
          waitTarget: waitForNavigation ? true : waitForSelector
        }
      );
    }
    
    return createSuccessResult({
      action: rightClick ? 'rightClick' : 'click',
      element: elementInfo,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createErrorResult(
      `Click operation failed: ${error.message}`,
      { target, options }
    );
  }
}

/**
 * Type text into an element
 * 
 * @param {string} target - CSS selector or XPath of element
 * @param {string} text - Text to type
 * @param {Object} [options] - Typing options
 * @param {boolean} [options.clear=true] - Clear field before typing
 * @param {boolean} [options.delay=0] - Delay between keystrokes in ms
 * @returns {Promise<Object>} Result of typing action
 */
async function type(target, text, options = {}) {
  try {
    const {
      clear = true,
      delay = 0
    } = options;
    
    // Find element
    const element = findElement(target);
    
    if (!element) {
      return createErrorResult(
        `Target element not found: ${target}`,
        { target, options }
      );
    }
    
    // Check if element is a valid input field
    const validTags = ['input', 'textarea', 'select', '[contenteditable="true"]'];
    const tag = element.tagName.toLowerCase();
    const isContentEditable = element.hasAttribute('contenteditable') && 
                            element.getAttribute('contenteditable') !== 'false';
    
    if (!validTags.includes(tag) && !isContentEditable) {
      return createErrorResult(
        `Target is not a valid input field: ${target}`,
        { 
          target, 
          elementTag: tag, 
          isContentEditable
        }
      );
    }
    
    // Get element information
    const elementInfo = getElementInfo(element, target);
    
    // Clear field if requested
    if (clear) {
      if (isContentEditable) {
        element.textContent = '';
      } else {
        element.value = '';
      }
      
      // Dispatch events for clearing
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Type the text
    if (delay > 0) {
      // Type with delay between keystrokes
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        
        // Set value (different for regular inputs vs contenteditable)
        if (isContentEditable) {
          element.textContent += char;
        } else {
          element.value += char;
        }
        
        // Dispatch events for typing
        element.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Wait for specified delay
        if (i < text.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } else {
      // Set value all at once
      if (isContentEditable) {
        element.textContent = text;
      } else {
        element.value = text;
      }
    }
    
    // Dispatch final events
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    return createSuccessResult({
      action: 'type',
      element: elementInfo,
      text: text.length > 100 ? `${text.substring(0, 100)}...` : text,
      textLength: text.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createErrorResult(
      `Type operation failed: ${error.message}`,
      { target, textLength: text?.length || 0, options }
    );
  }
}

/**
 * Select an option from a dropdown
 * 
 * @param {string} target - CSS selector or XPath of select element
 * @param {string|string[]} value - Option value(s) or text to select
 * @param {Object} [options] - Selection options
 * @param {boolean} [options.byText=false] - Select by option text instead of value
 * @param {boolean} [options.multiple=false] - Allow multiple selections
 * @returns {Object} Result of select action
 */
function select(target, value, options = {}) {
  try {
    const {
      byText = false,
      multiple = false
    } = options;
    
    // Find element
    const element = findElement(target);
    
    if (!element) {
      return createErrorResult(
        `Target element not found: ${target}`,
        { target, options }
      );
    }
    
    // Check if element is a select
    if (element.tagName.toLowerCase() !== 'select') {
      return createErrorResult(
        `Target is not a select element: ${target}`,
        { 
          target, 
          elementTag: element.tagName.toLowerCase()
        }
      );
    }
    
    // Get element information
    const elementInfo = getElementInfo(element, target);
    
    // Convert value to array for consistent processing
    const valuesToSelect = Array.isArray(value) ? value : [value];
    
    // Check if multiple selection is supported
    if (valuesToSelect.length > 1 && !element.multiple && !multiple) {
      return createErrorResult(
        'Multiple values provided but select element does not support multiple selection',
        { 
          target, 
          valuesCount: valuesToSelect.length,
          elementMultiple: element.multiple
        }
      );
    }
    
    // Clear existing selections if multiple
    if (element.multiple) {
      for (let i = 0; i < element.options.length; i++) {
        element.options[i].selected = false;
      }
    }
    
    // Track successful selections
    const selections = [];
    const errors = [];
    
    // Select options
    for (const selectValue of valuesToSelect) {
      let found = false;
      
      for (let i = 0; i < element.options.length; i++) {
        const option = element.options[i];
        const match = byText
          ? option.text.trim() === selectValue.trim()
          : option.value === selectValue;
        
        if (match) {
          option.selected = true;
          found = true;
          selections.push({
            value: option.value,
            text: option.text.trim()
          });
          break;
        }
      }
      
      if (!found) {
        // If exact match failed, try partial match for text
        if (byText) {
          for (let i = 0; i < element.options.length; i++) {
            const option = element.options[i];
            if (option.text.trim().includes(selectValue.trim())) {
              option.selected = true;
              selections.push({
                value: option.value,
                text: option.text.trim(),
                partialMatch: true
              });
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          errors.push(`Option not found: ${selectValue}`);
        }
      }
    }
    
    // Dispatch events
    element.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Return success if at least one option was selected
    if (selections.length > 0) {
      return createSuccessResult({
        action: 'select',
        element: elementInfo,
        selections,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString()
      });
    } else {
      return createErrorResult(
        'No matching options found',
        { 
          target, 
          requestedValues: valuesToSelect,
          errors,
          availableOptions: Array.from(element.options).map(opt => ({
            value: opt.value,
            text: opt.text.trim()
          }))
        }
      );
    }
  } catch (error) {
    return createErrorResult(
      `Select operation failed: ${error.message}`,
      { target, value, options }
    );
  }
}

/**
 * Hover over an element
 * 
 * @param {string} target - CSS selector or XPath of element
 * @param {Object} [options] - Hover options
 * @param {number} [options.duration=0] - How long to hover in ms
 * @returns {Promise<Object>} Result of hover action
 */
async function hover(target, options = {}) {
  try {
    const {
      duration = 0
    } = options;
    
    // Find element
    const element = findElement(target);
    
    if (!element) {
      return createErrorResult(
        `Target element not found: ${target}`,
        { target, options }
      );
    }
    
    // Get element information
    const elementInfo = getElementInfo(element, target);
    
    // Dispatch hover events
    element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    
    // Wait for duration if specified
    if (duration > 0) {
      await new Promise(resolve => setTimeout(resolve, duration));
      
      // Dispatch mouseout events after duration
      element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    }
    
    return createSuccessResult({
      action: 'hover',
      element: elementInfo,
      duration,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createErrorResult(
      `Hover operation failed: ${error.message}`,
      { target, options }
    );
  }
}

/**
 * Scroll page or element
 * 
 * @param {Object} options - Scroll options
 * @param {string} [options.target] - CSS selector or XPath of element to scroll
 * @param {number} [options.x] - Horizontal scroll position
 * @param {number} [options.y] - Vertical scroll position
 * @param {string} [options.behavior='smooth'] - Scroll behavior: 'auto' or 'smooth'
 * @returns {Object} Result of scroll action
 */
function scroll(options = {}) {
  try {
    const {
      target = null,
      x = undefined,
      y = undefined,
      behavior = 'smooth'
    } = options;
    
    // If target is specified, scroll the element into view
    if (target) {
      // Find element
      const element = findElement(target);
      
      if (!element) {
        return createErrorResult(
          `Target element not found: ${target}`,
          { options }
        );
      }
      
      // Get element information
      const elementInfo = getElementInfo(element, target);
      
      // Scroll element into view
      element.scrollIntoView({
        behavior,
        block: 'center',
        inline: 'center'
      });
      
      return createSuccessResult({
        action: 'scrollToElement',
        element: elementInfo,
        behavior,
        timestamp: new Date().toISOString()
      });
    } else if (x !== undefined || y !== undefined) {
      // Scroll window to position
      window.scrollTo({
        top: y !== undefined ? y : window.scrollY,
        left: x !== undefined ? x : window.scrollX,
        behavior
      });
      
      return createSuccessResult({
        action: 'scrollPosition',
        x: x !== undefined ? x : window.scrollX,
        y: y !== undefined ? y : window.scrollY,
        behavior,
        timestamp: new Date().toISOString()
      });
    } else {
      return createErrorResult(
        'Invalid scroll options: must specify target or x/y position',
        { options }
      );
    }
  } catch (error) {
    return createErrorResult(
      `Scroll operation failed: ${error.message}`,
      { options }
    );
  }
}

// Export the Perform tool
export default {
  click,
  type,
  select,
  hover,
  scroll
};