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

// Import the four essential tools from the tools directory
import { Navigate, Extract, Visualize, Perform } from './tools/index.js';

// Export only the four essential tools
export default {
  Navigate,
  Extract,
  Visualize,
  Perform
};