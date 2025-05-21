/**
 * BrowserMagic DOM - LLM Tools Example
 * 
 * This example demonstrates how to use the four essential browser tools for LLMs:
 * - Navigate: Browser navigation
 * - Extract: DOM element extraction
 * - Visualize: Visual and accessibility information
 * - Perform: User action execution
 */

// Import the tools
import BrowserMagicDOM from './index.js';

const { Navigate, Extract, Visualize, Perform } = BrowserMagicDOM;

/**
 * Example 1: Navigation and Extraction
 * 
 * This example demonstrates how to navigate to a page and extract data.
 */
async function navigationAndExtractionExample() {
  console.log('--- Navigation and Extraction Example ---');
  
  // Navigate to a webpage
  console.log('Navigating to example.com...');
  const navResult = await Navigate.to('https://example.com', { waitForLoad: true });
  
  if (navResult.success) {
    console.log(`Successfully navigated to ${navResult.data.currentUrl}`);
    console.log(`Page title: ${navResult.data.title}`);
    
    // Extract all links on the page
    console.log('\nExtracting links...');
    const extractResult = Extract.elements('a', { 
      visible: true,
      extract: {
        text: true,
        attributes: ['href', 'target']
      }
    });
    
    if (extractResult.success) {
      console.log(`Found ${extractResult.data.count} links:`);
      extractResult.data.elements.forEach(link => {
        console.log(` - "${link.text}" -> ${link.attributes.href}`);
      });
    } else {
      console.error('Link extraction failed:', extractResult.error);
    }
    
    // Extract page information
    console.log('\nExtracting page info...');
    const pageInfoResult = Extract.pageInfo();
    
    if (pageInfoResult.success) {
      console.log('Page metadata:', pageInfoResult.data.metadata);
      console.log('Element counts:', pageInfoResult.data.elementCounts);
    } else {
      console.error('Page info extraction failed:', pageInfoResult.error);
    }
  } else {
    console.error('Navigation failed:', navResult.error);
  }
}

/**
 * Example 2: Visualization
 * 
 * This example demonstrates how to use visualization tools.
 */
async function visualizationExample() {
  console.log('\n--- Visualization Example ---');
  
  // Take a screenshot (placeholder implementation)
  console.log('Taking a screenshot...');
  const screenshotResult = await Visualize.screenshot({ fullPage: true });
  
  if (screenshotResult.success) {
    console.log('Screenshot taken at:', screenshotResult.data.timestamp);
    console.log(`For page: ${screenshotResult.data.title}`);
    // In a real implementation, you might save the image or display it
  } else {
    console.error('Screenshot failed:', screenshotResult.error);
  }
  
  // Get accessibility tree
  console.log('\nGenerating accessibility tree...');
  const a11yResult = Visualize.accessibilityTree({ depth: 2 });
  
  if (a11yResult.success) {
    console.log('Accessibility tree root node:', a11yResult.data.tree.tag);
    console.log(`Tree contains ${countNodes(a11yResult.data.tree)} nodes`);
    
    // Helper function to count nodes in tree
    function countNodes(node) {
      if (!node.children) return 1;
      return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
    }
  } else {
    console.error('Accessibility tree generation failed:', a11yResult.error);
  }
  
  // Get DOM structure
  console.log('\nGenerating DOM structure...');
  const domResult = Visualize.domStructure({ depth: 3 });
  
  if (domResult.success) {
    console.log(`Generated DOM structure for ${domResult.data.title}`);
    console.log('Structure summary:', summarizeStructure(domResult.data.structure));
    
    // Helper function to summarize structure
    function summarizeStructure(node, depth = 0) {
      const result = { nodeCount: 1, maxDepth: depth };
      
      if (node.children && node.children.length > 0) {
        for (const child of node.children) {
          const childSummary = summarizeStructure(child, depth + 1);
          result.nodeCount += childSummary.nodeCount;
          result.maxDepth = Math.max(result.maxDepth, childSummary.maxDepth);
        }
      }
      
      return result;
    }
  } else {
    console.error('DOM structure generation failed:', domResult.error);
  }
}

/**
 * Example 3: User Actions
 * 
 * This example demonstrates how to perform user actions.
 */
async function userActionsExample() {
  console.log('\n--- User Actions Example ---');
  
  // Find a link to click
  console.log('Finding a link to click...');
  const extractResult = Extract.elements('a');
  
  if (extractResult.success && extractResult.data.count > 0) {
    const link = extractResult.data.elements[0];
    console.log(`Found link: "${link.text}" at ${link.xpath}`);
    
    // Click the link
    console.log('Clicking the link...');
    const clickResult = await Perform.click(link.xpath, { waitForNavigation: true });
    
    if (clickResult.success) {
      console.log(`Successfully clicked link and navigated to: ${window.location.href}`);
      
      // Go back to previous page
      console.log('\nNavigating back...');
      const backResult = await Navigate.history('back', { waitForLoad: true });
      
      if (backResult.success) {
        console.log(`Successfully navigated back to: ${backResult.data.currentUrl}`);
        
        // Find an input field
        const inputResult = Extract.elements('input');
        
        if (inputResult.success && inputResult.data.count > 0) {
          const input = inputResult.data.elements[0];
          console.log(`\nFound input field at ${input.xpath}`);
          
          // Type into the input field
          console.log('Typing into the input field...');
          const typeResult = await Perform.type(input.xpath, 'Hello, world!', { 
            clear: true,
            delay: 50
          });
          
          if (typeResult.success) {
            console.log('Successfully typed into input field');
          } else {
            console.error('Typing failed:', typeResult.error);
          }
        } else {
          console.log('No input fields found on the page');
        }
      } else {
        console.error('Navigation back failed:', backResult.error);
      }
    } else {
      console.error('Click operation failed:', clickResult.error);
    }
  } else {
    console.log('No links found on the page');
    
    // Demonstrate scroll instead
    console.log('\nScrolling the page...');
    const scrollResult = await Perform.scroll({ y: 100, behavior: 'smooth' });
    
    if (scrollResult.success) {
      console.log('Successfully scrolled the page');
    } else {
      console.error('Scroll operation failed:', scrollResult.error);
    }
  }
}

/**
 * Run all examples
 */
export async function runExamples() {
  try {
    // Wait for DOM to be ready
    if (document.readyState !== 'complete') {
      await new Promise(resolve => {
        window.addEventListener('load', resolve, { once: true });
      });
    }
    
    await navigationAndExtractionExample();
    await visualizationExample();
    await userActionsExample();
    
    console.log('\nAll examples completed successfully');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Uncomment to run examples automatically when script is loaded
// runExamples();