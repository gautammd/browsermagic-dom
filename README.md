# BrowserMagic DOM

A lightweight, focused library providing essential tools for LLMs to interact with browser content.

## Four Essential Browser Tools for LLMs

This library provides four core tools designed specifically for Language Learning Models (LLMs) to interact with web browsers:

1. **Navigate**: Browser navigation and history management
2. **Extract**: DOM element extraction and data retrieval
3. **Visualize**: Visual and accessibility information
4. **Perform**: User action execution

## Usage

```javascript
import BrowserMagicDOM from 'browsermagic-dom';

const { Navigate, Extract, Visualize, Perform } = BrowserMagicDOM;

// Use the tools
async function example() {
  // Navigation
  await Navigate.to('https://example.com', { waitForLoad: true });
  
  // Extract elements
  const links = Extract.elements('a', { visible: true });
  
  // Visualize page
  const a11yTree = Visualize.accessibilityTree({ depth: 3 });
  
  // Perform actions
  await Perform.click('#submit-button', { waitForNavigation: true });
  await Perform.type('#search-input', 'Hello, world!');
}
```

## Tool Documentation

### Navigate

Handles URL navigation, browser history, and provides navigation state information.

- **Navigate.to(url, options)**: Navigate to a URL
- **Navigate.history(direction, options)**: Navigate browser history (back, forward, refresh)
- **Navigate.getState()**: Get current browser navigation state

### Extract

DOM element extraction and data retrieval based on queries.

- **Extract.elements(query, options)**: Extract elements and data from the DOM
- **Extract.pageInfo()**: Extract page metadata and context

### Visualize

Visual and accessibility information tools.

- **Visualize.screenshot(options)**: Take a screenshot of the page or element
- **Visualize.accessibilityTree(options)**: Get accessibility tree information
- **Visualize.domStructure(options)**: Get DOM structure visualization
- **Visualize.snapshot(options)**: Get a detailed snapshot of the page

### Perform

User action execution tool.

- **Perform.click(target, options)**: Click an element
- **Perform.type(target, text, options)**: Type text into an element
- **Perform.select(target, value, options)**: Select an option from a dropdown
- **Perform.hover(target, options)**: Hover over an element
- **Perform.scroll(options)**: Scroll page or element

## Implementation Notes

- Production-grade, focused implementation
- Single responsibility design principles
- Optimized for browser environments
- Detailed error handling and reporting