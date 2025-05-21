/**
 * BrowserMagic DOM Agent Tools
 * 
 * A collection of tools for AI agents to analyze and interact with the DOM.
 * Built on top of the browsermagic-dom library core functionality.
 * 
 * @version 1.0.0
 * @license MIT
 */
import { 
  takeSnapshot, 
  findElementByXPath,
  getXPath, 
  isElementVisible,
  getVisibleText
} from './browsermagic-dom.js';

/**
 * DOM Analysis Tools
 */
const DOMTools = {
  /**
   * Takes a snapshot of the current page
   * @param {Object} options - Snapshot options
   * @returns {Object} - Page snapshot with all elements
   */
  analyzeDOM: (options = {}) => {
    return takeSnapshot(options);
  },

  /**
   * Finds all elements matching a specific selector
   * @param {string} selector - CSS selector
   * @returns {Array} - Array of element snapshots
   */
  findElements: (selector) => {
    const elements = Array.from(document.querySelectorAll(selector));
    return elements.map(element => {
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName.toLowerCase(),
        xpath: getXPath(element),
        text: getVisibleText(element),
        inViewport: isElementVisible(element),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });
  },

  /**
   * Finds all elements matching text content
   * @param {string} text - Text to search for
   * @param {boolean} exact - Whether to match exact text
   * @returns {Array} - Array of element snapshots
   */
  findElementsByText: (text, exact = false) => {
    // Get all elements in the page
    const snapshot = takeSnapshot();
    
    // Filter elements by text content
    return snapshot.keyElements.filter(element => {
      if (!element.text) return false;
      
      if (exact) {
        return element.text.trim() === text.trim();
      } else {
        return element.text.toLowerCase().includes(text.toLowerCase());
      }
    });
  },

  /**
   * Gets contextual information about the page
   * @returns {Object} - Page context information
   */
  getPageContext: () => {
    const snapshot = takeSnapshot();
    return {
      url: snapshot.url,
      title: snapshot.title,
      metadata: snapshot.metadata,
      elementCount: snapshot.keyElements.length,
      viewport: snapshot.viewport,
      semanticGroups: snapshot.semanticGroups
    };
  }
};

/**
 * Element Interaction Tools
 */
const InteractionTools = {
  /**
   * Clicks an element by XPath
   * @param {string} xpath - XPath of the element to click
   * @returns {Object} - Result of the click operation
   */
  clickElement: (xpath) => {
    try {
      const element = findElementByXPath(xpath);
      if (!element) {
        return { 
          success: false, 
          error: `Element not found: ${xpath}` 
        };
      }

      // Before clicking, capture element information for better result reporting
      const tagName = element.tagName.toLowerCase();
      const textContent = element.textContent?.trim().substring(0, 20) || '';
      const truncated = element.textContent?.length > 20 ? '...' : '';

      // Perform the click
      element.click();
      
      return { 
        success: true, 
        action: 'click',
        element: {
          tag: tagName,
          text: textContent + truncated,
          xpath: xpath
        }
      };
    } catch (error) {
      return { 
        success: false, 
        action: 'click',
        error: error.message, 
        xpath: xpath 
      };
    }
  },

  /**
   * Fills a form element with text
   * @param {string} xpath - XPath of the element to fill
   * @param {string} value - Value to fill
   * @returns {Object} - Result of the fill operation
   */
  fillElement: (xpath, value) => {
    try {
      const element = findElementByXPath(xpath);
      if (!element) {
        return { 
          success: false, 
          error: `Element not found: ${xpath}` 
        };
      }

      // Handle different input types
      const tagName = element.tagName.toLowerCase();
      
      if (tagName === 'select') {
        // Handle select elements
        const options = Array.from(element.options);
        const lowerValue = value.toLowerCase();
        
        // Try exact match first, then partial match
        let option = options.find(opt => 
          opt.value === value || opt.text === value
        );
        
        if (!option) {
          option = options.find(opt => 
            opt.text.toLowerCase().includes(lowerValue)
          );
        }
        
        if (option) {
          element.value = option.value;
        } else {
          throw new Error(`Could not find option matching "${value}" in dropdown`);
        }
      } else {
        // Handle text inputs, textareas, etc.
        element.value = value;
      }

      // Dispatch events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      return { 
        success: true, 
        action: 'fill',
        element: {
          tag: tagName,
          xpath: xpath
        },
        value: value
      };
    } catch (error) {
      return { 
        success: false, 
        action: 'fill',
        error: error.message, 
        xpath: xpath 
      };
    }
  },

  /**
   * Scrolls to an element
   * @param {string} xpath - XPath of the element to scroll to
   * @returns {Object} - Result of the scroll operation
   */
  scrollToElement: (xpath) => {
    try {
      const element = findElementByXPath(xpath);
      if (!element) {
        return { 
          success: false, 
          error: `Element not found: ${xpath}` 
        };
      }

      // Scroll the element into view
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      
      return { 
        success: true, 
        action: 'scroll',
        element: {
          tag: element.tagName.toLowerCase(),
          xpath: xpath
        }
      };
    } catch (error) {
      return { 
        success: false, 
        action: 'scroll',
        error: error.message, 
        xpath: xpath 
      };
    }
  },

  /**
   * Hovers over an element
   * @param {string} xpath - XPath of the element to hover
   * @returns {Object} - Result of the hover operation
   */
  hoverElement: (xpath) => {
    try {
      const element = findElementByXPath(xpath);
      if (!element) {
        return { 
          success: false, 
          error: `Element not found: ${xpath}` 
        };
      }

      // Dispatch mouse events to simulate hover
      element.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      
      return { 
        success: true, 
        action: 'hover',
        element: {
          tag: element.tagName.toLowerCase(),
          xpath: xpath
        }
      };
    } catch (error) {
      return { 
        success: false, 
        action: 'hover',
        error: error.message, 
        xpath: xpath 
      };
    }
  }
};

/**
 * Navigation Tools
 */
const NavigationTools = {
  /**
   * Navigates to a URL
   * @param {string} url - URL to navigate to
   * @returns {Object} - Result of the navigation operation
   */
  navigateTo: (url) => {
    try {
      // Validate URL
      new URL(url); // Will throw if invalid
      
      // Create the result
      const result = {
        success: true,
        action: 'navigate',
        url: url
      };
      
      // Schedule navigation to happen after response is sent
      setTimeout(() => {
        try {
          window.location.href = url;
        } catch (e) {
          console.error('Navigation failed:', e);
        }
      }, 50);
      
      return result;
    } catch (error) {
      return {
        success: false,
        action: 'navigate',
        url: url,
        error: error.message
      };
    }
  },

  /**
   * Performs browser back navigation
   * @returns {Object} - Result of the operation
   */
  goBack: () => {
    try {
      const canGoBack = window.history.length > 1;
      
      if (!canGoBack) {
        return {
          success: false,
          action: 'goBack',
          error: 'Cannot go back - no previous page in history'
        };
      }
      
      // Schedule the navigation
      setTimeout(() => {
        window.history.back();
      }, 50);
      
      return {
        success: true,
        action: 'goBack'
      };
    } catch (error) {
      return {
        success: false,
        action: 'goBack',
        error: error.message
      };
    }
  },

  /**
   * Gets the current URL
   * @returns {string} - Current URL
   */
  getCurrentURL: () => {
    return window.location.href;
  }
};

/**
 * History-state Tools
 */
const HistoryTools = {
  /**
   * Gets the browser history length
   * @returns {number} - History length
   */
  getHistoryLength: () => {
    return window.history.length;
  },

  /**
   * Checks if forward navigation is possible
   * @returns {boolean} - Whether forward navigation is possible
   */
  canGoForward: () => {
    // This is an approximation as there's no direct API for this
    try {
      const testWindow = window.open('', '_blank');
      if (testWindow) {
        testWindow.close();
        return true; // If we can open a window, assume we can go forward
      }
      return false;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Agent tools for browser automation
 */
const AgentTools = {
  DOM: DOMTools,
  Interaction: InteractionTools,
  Navigation: NavigationTools,
  History: HistoryTools,

  /**
   * Execute a command received from an AI agent
   * @param {Object} command - Command to execute
   * @returns {Object} - Result of command execution
   */
  executeCommand: (command) => {
    if (!command || !command.action) {
      return { 
        success: false, 
        error: 'Invalid command: missing action' 
      };
    }

    // Handle command based on action type
    switch (command.action) {
      case 'click':
        return InteractionTools.clickElement(command.xpath);
      
      case 'fill':
        return InteractionTools.fillElement(command.xpath, command.value);
      
      case 'navigate':
        return NavigationTools.navigateTo(command.url);
      
      case 'scroll':
        return InteractionTools.scrollToElement(command.xpath);
      
      case 'hover':
        return InteractionTools.hoverElement(command.xpath);
      
      case 'goBack':
        return NavigationTools.goBack();
      
      case 'analyze':
        return { 
          success: true, 
          action: 'analyze',
          result: DOMTools.analyzeDOM()
        };
      
      default:
        return { 
          success: false, 
          error: `Unknown command action: ${command.action}` 
        };
    }
  },

  /**
   * Execute a sequence of commands
   * @param {Array} commands - Array of commands to execute
   * @returns {Object} - Results of all commands
   */
  executeCommands: async (commands) => {
    if (!Array.isArray(commands) || commands.length === 0) {
      return {
        success: false,
        error: 'Invalid commands: expected non-empty array'
      };
    }

    const results = {
      success: true,
      commandResults: []
    };

    for (let i = 0; i < commands.length; i++) {
      // Execute each command
      const result = AgentTools.executeCommand(commands[i]);
      results.commandResults.push(result);

      // If a command fails, stop execution
      if (!result.success) {
        results.success = false;
        results.error = `Command ${i + 1} failed: ${result.error}`;
        break;
      }

      // Add delay between commands to let page update
      if (i < commands.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    return results;
  }
};

export default AgentTools;