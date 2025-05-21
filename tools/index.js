/**
 * BrowserMagic DOM - LLM Tools
 * 
 * Entry point for the four essential browser tools for LLMs:
 * - Navigate: Browser navigation and history management
 * - Extract: DOM element extraction and data retrieval
 * - Visualize: Visual and accessibility information
 * - Perform: User action execution
 * 
 * @version 1.0.0
 * @license MIT
 */

// Import individual tools
import Navigate from './navigate.js';
import Extract from './extract.js';
import Visualize from './visualize.js';
import Perform from './perform.js';

// Re-export all tools
export {
  Navigate,
  Extract,
  Visualize,
  Perform
};

// Default export with all tools
export default {
  Navigate,
  Extract,
  Visualize,
  Perform
};