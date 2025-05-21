/**
 * BrowserMagic DOM
 * Main entry point for CommonJS environments
 * 
 * Four Essential Browser Tools for LLMs:
 * - Navigate: Browser navigation and history management
 * - Extract: DOM element extraction and data retrieval
 * - Visualize: Visual and accessibility information
 * - Perform: User action execution
 * 
 * @version 1.0.0
 * @license MIT
 */

// Import everything directly to ensure proper bundling
import Navigate from './tools/navigate.js';
import Extract from './tools/extract.js';
import Visualize from './tools/visualize.js';
import Perform from './tools/perform.js';
import { getXPath, findElementByXPath, takeSnapshot } from './core.js';

// Named exports for individual tools
export { Navigate, Extract, Visualize, Perform };

// Export core functions
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