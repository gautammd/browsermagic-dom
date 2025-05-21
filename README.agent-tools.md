# BrowserMagic DOM Agent Tools

A collection of tools for AI agents to interact with web pages, built on top of the BrowserMagic DOM library.

## Overview

BrowserMagic DOM Agent Tools provides a comprehensive API for AI agents to analyze the DOM and interact with web pages. It follows the single responsibility principle, with clear separation of concerns between different types of operations.

## Installation

```bash
npm install browsermagic-dom
```

## Usage

```javascript
import AgentTools from 'browsermagic-dom/agent-tools';

// Analyze the DOM
const pageContext = AgentTools.DOM.getPageContext();
console.log(`Current page: ${pageContext.title}`);

// Interact with elements
const result = AgentTools.Interaction.clickElement('/html/body/div/button[1]');
if (result.success) {
  console.log('Button clicked successfully');
} else {
  console.error(`Click failed: ${result.error}`);
}
```

## Tool Categories

The agent tools are organized into logical categories:

### DOM Tools

Tools for analyzing the DOM structure and finding elements:

```javascript
// Take a snapshot of the entire DOM
const snapshot = AgentTools.DOM.analyzeDOM();

// Find elements by CSS selector
const buttons = AgentTools.DOM.findElements('button.primary');

// Find elements by text content
const loginElements = AgentTools.DOM.findElementsByText('Log in', false);

// Get page context for AI analysis
const context = AgentTools.DOM.getPageContext();
```

### Interaction Tools

Tools for interacting with elements on the page:

```javascript
// Click an element by XPath
AgentTools.Interaction.clickElement('/html/body/div/button[1]');

// Fill a form element
AgentTools.Interaction.fillElement('/html/body/form/input[1]', 'username');

// Scroll to bring an element into view
AgentTools.Interaction.scrollToElement('/html/body/div[5]/p[3]');

// Hover over an element
AgentTools.Interaction.hoverElement('/html/body/nav/ul/li[2]/a');
```

### Navigation Tools

Tools for page navigation:

```javascript
// Navigate to a URL
AgentTools.Navigation.navigateTo('https://example.com');

// Go back to previous page
AgentTools.Navigation.goBack();

// Get current URL
const currentURL = AgentTools.Navigation.getCurrentURL();
```

### History Tools

Tools for working with browser history:

```javascript
// Get browser history length
const historyLength = AgentTools.History.getHistoryLength();

// Check if forward navigation is possible
const canGoForward = AgentTools.History.canGoForward();
```

## Handling AI Commands

The AgentTools provides utilities to execute commands received from an AI:

```javascript
// Execute a single command
const result = AgentTools.executeCommand({
  action: 'click',
  xpath: '/html/body/div/button[1]'
});

// Execute a sequence of commands
const results = await AgentTools.executeCommands([
  { action: 'navigate', url: 'https://example.com' },
  { action: 'fill', xpath: '//*[@id="username"]', value: 'user123' },
  { action: 'click', xpath: '//*[@id="login-btn"]' }
]);
```

## Command Structure

Commands follow a consistent structure:

### Click Command
```javascript
{
  action: 'click',
  xpath: '/html/body/div/button[1]'
}
```

### Fill Command
```javascript
{
  action: 'fill',
  xpath: '/html/body/form/input[1]',
  value: 'text to input'
}
```

### Navigate Command
```javascript
{
  action: 'navigate',
  url: 'https://example.com'
}
```

### Scroll Command
```javascript
{
  action: 'scroll',
  xpath: '/html/body/div[5]/p[3]'
}
```

### Hover Command
```javascript
{
  action: 'hover',
  xpath: '/html/body/nav/ul/li[2]/a'
}
```

### GoBack Command
```javascript
{
  action: 'goBack'
}
```

### Analyze Command
```javascript
{
  action: 'analyze'
}
```

## Integration with AI Models

When integrating with AI models, use the following pattern:

```javascript
// 1. Capture the current page state
const pageContext = AgentTools.DOM.getPageContext();

// 2. Send page context to AI model
const aiResponse = await sendToAI(pageContext);

// 3. Execute the commands from the AI
const results = await AgentTools.executeCommands(aiResponse.commands);

// 4. After executing commands, capture the new state for the next iteration
const newPageContext = AgentTools.DOM.getPageContext();
```

## Error Handling

All tools return consistent result objects with success/failure indicators:

```javascript
// Success result example
{
  success: true,
  action: 'click',
  element: {
    tag: 'button',
    text: 'Submit',
    xpath: '/html/body/div/button[1]'
  }
}

// Error result example
{
  success: false,
  action: 'click',
  error: 'Element not found: /html/body/div/button[1]',
  xpath: '/html/body/div/button[1]'
}
```

## Performance Considerations

For large pages, you can optimize DOM analysis:

```javascript
// Only analyze specific elements
const snapshot = AgentTools.DOM.analyzeDOM({
  elementFilter: ['a', 'button', 'input'],
  captureOutOfViewport: false
});
```

## License

MIT