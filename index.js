/**
 * BrowserMagic DOM
 * Main entry point that exports all components
 */

// Import core functionality
import * as BrowserMagicDOM from './browsermagic-dom.js';

// Import agent tools
import AgentTools from './agent-tools.js';

// Re-export everything
export default {
  // Core DOM functionality
  ...BrowserMagicDOM,
  
  // Agent tools
  Agent: AgentTools
};