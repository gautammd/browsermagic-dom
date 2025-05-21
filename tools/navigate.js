/**
 * BrowserMagic DOM - Navigate Tool
 * 
 * Browser navigation tool that handles URL navigation, browser history,
 * and provides navigation state information.
 * 
 * @version 1.0.0
 * @license MIT
 */

import { 
  createSuccessResult, 
  createErrorResult, 
  createLoadPromise 
} from './utils.js';

/**
 * Navigate to a URL
 * 
 * @param {string} url - URL to navigate to
 * @param {Object} [options] - Navigation options
 * @param {boolean} [options.waitForLoad=true] - Wait for page to fully load
 * @param {number} [options.timeout=30000] - Maximum wait time in ms
 * @returns {Promise<Object>} Result with page information
 */
async function to(url, options = {}) {
  try {
    // Validate URL
    new URL(url); // Will throw if invalid
    
    const currentUrl = window.location.href;
    
    // Create result data with basic info
    const resultData = {
      url,
      previousUrl: currentUrl,
      timestamp: new Date().toISOString()
    };
    
    // Create a promise that resolves when the page loads
    const navigationPromise = createLoadPromise(options);
    
    // Navigate to the URL
    window.location.href = url;
    
    // Wait for navigation to complete
    const loadData = await navigationPromise;
    
    // Merge load data with result data
    Object.assign(resultData, loadData);
    resultData.loadSuccess = true;
    
    return createSuccessResult(resultData);
  } catch (error) {
    return createErrorResult(
      `Navigation failed: ${error.message}`,
      {
        url,
        currentUrl: window.location.href
      }
    );
  }
}

/**
 * Navigate browser history (back, forward, refresh)
 * 
 * @param {string} direction - Direction: "back", "forward", or "refresh"
 * @param {Object} [options] - Navigation options
 * @param {boolean} [options.waitForLoad=true] - Wait for page to fully load
 * @param {number} [options.timeout=30000] - Maximum wait time in ms
 * @returns {Promise<Object>} Result with page information
 */
async function history(direction, options = {}) {
  try {
    const currentUrl = window.location.href;
    const currentTitle = document.title;
    
    // Validate direction
    if (!['back', 'forward', 'refresh'].includes(direction)) {
      throw new Error(`Invalid direction: ${direction}. Must be 'back', 'forward', or 'refresh'`);
    }
    
    // Check if we can navigate as requested
    if (direction === 'back' && window.history.length <= 1) {
      return createErrorResult(
        'Cannot go back - no previous page in history',
        { currentUrl, direction }
      );
    }
    
    // Create promise for navigation
    const navigationPromise = createLoadPromise(options);
    
    // Perform the navigation
    switch (direction) {
      case 'back':
        window.history.back();
        break;
      case 'forward':
        window.history.forward();
        break;
      case 'refresh':
        window.location.reload();
        break;
    }
    
    // Wait for navigation to complete
    const loadData = await navigationPromise;
    
    // Create result with navigation information
    const resultData = {
      previousUrl: currentUrl,
      previousTitle: currentTitle,
      direction,
      ...loadData
    };
    
    return createSuccessResult(resultData);
  } catch (error) {
    return createErrorResult(
      `History navigation failed: ${error.message}`,
      {
        direction,
        currentUrl: window.location.href
      }
    );
  }
}

/**
 * Get current browser navigation state
 * 
 * @returns {Object} Result with navigation state
 */
function getState() {
  try {
    return createSuccessResult({
      url: window.location.href,
      title: document.title,
      historyLength: window.history.length,
      canGoBack: window.history.length > 1,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createErrorResult(`Failed to get navigation state: ${error.message}`);
  }
}

// Export the Navigate tool
export default {
  to,
  history,
  getState
};