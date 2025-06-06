/**
 * BrowserMagic DOM
 * Four Essential Browser Tools for LLMs
 * 
 * A lightweight, focused library providing essential tools for LLMs
 * to interact with browser content:
 * 
 * - Navigate: Browser navigation and history management
 * - Extract: DOM element extraction and data retrieval
 * - Visualize: Visual and accessibility information
 * - Perform: User action execution
 * 
 * @version 1.0.0
 * @license MIT
 */

// Import the core functions for direct export
import { getXPath, findElementByXPath, takeSnapshot } from './core.js';

// Import the four essential tools from the tools directory
import Navigate from './tools/navigate.js';
import Extract from './tools/extract.js';
import Visualize from './tools/visualize.js';
import Perform from './tools/perform.js';

// Named exports for individual tools
export { Navigate, Extract, Visualize, Perform };

// Export core functions that might be needed directly
export { getXPath, findElementByXPath, takeSnapshot };

// Default export for the entire library
export default {
  Navigate,
  Extract,
  Visualize,
  Perform,
  getXPath,
  findElementByXPath,
  takeSnapshot
};