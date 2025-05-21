/**
 * BrowserMagic DOM - AI Agent Example
 * 
 * This example demonstrates how to integrate BrowserMagic DOM Agent Tools
 * with an AI system to automate browser interactions.
 */
import AgentTools from './agent-tools.js';

class BrowserAIAgent {
  constructor() {
    this.pageContext = null;
    this.actionHistory = [];
    this.initialPrompt = null;
  }

  /**
   * Initializes the agent with a user prompt
   * @param {string} prompt - Initial user prompt
   */
  async initialize(prompt) {
    this.initialPrompt = prompt;
    this.pageContext = AgentTools.DOM.getPageContext();
    this.actionHistory = [];
    
    console.log(`Initialized BrowserAI Agent on page: ${this.pageContext.title}`);
    console.log(`Initial prompt: ${prompt}`);
    
    return this.executeNextStep();
  }

  /**
   * Determines and executes the next action based on the current state
   */
  async executeNextStep() {
    // 1. Format current state for the AI
    const aiPrompt = this.formatPromptForAI();
    
    // 2. Get next command from AI (simulated in this example)
    const aiResponse = await this.getAIResponse(aiPrompt);
    
    // 3. Execute the command
    const result = await this.executeCommand(aiResponse.command);
    
    // 4. Add to action history
    this.actionHistory.push({
      command: aiResponse.command,
      result: result,
      timestamp: new Date().toISOString()
    });
    
    // 5. Update page context after command execution
    this.pageContext = AgentTools.DOM.getPageContext();
    
    // 6. Check if flow is completed
    if (aiResponse.isComplete) {
      console.log("Task completed successfully!");
      return {
        success: true,
        message: aiResponse.completionMessage || "Task completed",
        history: this.actionHistory
      };
    }
    
    // 7. If not complete, continue with next step
    return this.executeNextStep();
  }

  /**
   * Formats the current state as a prompt for the AI
   * @returns {string} - Formatted prompt
   */
  formatPromptForAI() {
    // Start with initial user instruction
    let prompt = `Initial instruction: "${this.initialPrompt}"\n\n`;
    
    // Add action history
    if (this.actionHistory.length > 0) {
      prompt += "Previously completed actions:\n";
      
      this.actionHistory.forEach((action, index) => {
        const success = action.result.success ? '✓' : '✗';
        
        prompt += `[${index + 1}] ${success} Action: ${action.command.action}, `;
        
        if (action.command.action === 'navigate') {
          prompt += `URL: "${action.command.url}"\n`;
        } else if (action.command.action === 'click') {
          prompt += `XPath: "${action.command.xpath}"\n`;
        } else if (action.command.action === 'fill') {
          prompt += `XPath: "${action.command.xpath}", ` +
                   `Value: "${action.command.value}"\n`;
        }
        
        // Add result details
        if (!action.result.success && action.result.error) {
          prompt += `    Error: ${action.result.error}\n`;
        }
      });
    }
    
    // Add current page information
    prompt += "\nCurrent page information:\n" +
              `URL: ${this.pageContext.url}\n` +
              `Title: ${this.pageContext.title}\n`;
    
    // Add page elements (simplified for readability)
    if (this.pageContext.elementCount > 0) {
      prompt += `\nThe page has ${this.pageContext.elementCount} elements.\n`;
      
      // Add information about semantic groups
      if (this.pageContext.semanticGroups) {
        const groups = this.pageContext.semanticGroups;
        
        prompt += "\nKey element groups:\n";
        if (groups.navigation && groups.navigation.length > 0) {
          prompt += `- ${groups.navigation.length} navigation elements\n`;
        }
        if (groups.interaction && groups.interaction.length > 0) {
          prompt += `- ${groups.interaction.length} interaction elements (buttons, links)\n`;
        }
        if (groups.forms && groups.forms.length > 0) {
          prompt += `- ${groups.forms.length} form elements\n`;
        }
        if (groups.content && groups.content.length > 0) {
          prompt += `- ${groups.content.length} content elements\n`;
        }
      }
    }
    
    // Add instruction for single command response
    prompt += "\nIMPORTANT: Please provide ONLY ONE command for the next action. After this command is executed, I will update you with the new page state.";
    
    return prompt;
  }

  /**
   * Gets the next command from the AI (simulated in this example)
   * @param {string} prompt - Formatted prompt for the AI
   * @returns {Object} - AI response with next command
   */
  async getAIResponse(prompt) {
    console.log("Sending prompt to AI...");
    
    // This would normally be an API call to an AI service
    // For this example, we'll simulate a response based on the action history
    
    // Simple simulation logic
    const actionCount = this.actionHistory.length;
    let command, isComplete = false, completionMessage;
    
    if (actionCount === 0) {
      // First action: navigate to example.com
      command = {
        action: 'navigate',
        url: 'https://example.com'
      };
    } else if (actionCount === 1) {
      // Second action: click a link
      command = {
        action: 'click',
        xpath: '/html/body/div/p[2]/a'
      };
    } else {
      // Third action: we're done
      command = {
        action: 'analyze'
      };
      isComplete = true;
      completionMessage = "Successfully visited example.com and clicked on the first link.";
    }
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      command,
      isComplete,
      completionMessage
    };
  }

  /**
   * Executes a command and returns the result
   * @param {Object} command - Command to execute
   * @returns {Object} - Command execution result
   */
  async executeCommand(command) {
    console.log(`Executing command: ${command.action}`);
    
    const result = AgentTools.executeCommand(command);
    
    // Log result
    if (result.success) {
      console.log(`Command successful: ${command.action}`);
    } else {
      console.error(`Command failed: ${result.error}`);
    }
    
    // Add a small delay to allow page to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return result;
  }
}

// Example usage
async function runExample() {
  const agent = new BrowserAIAgent();
  const result = await agent.initialize("Go to example.com and click on the first link");
  console.log("Final result:", result);
}

// Uncomment to run the example
// runExample().catch(console.error);

export default BrowserAIAgent;