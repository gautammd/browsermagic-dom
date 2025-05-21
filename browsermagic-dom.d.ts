declare module 'browsermagic-dom' {
  /**
   * Result object interface
   */
  interface Result<T> {
    success: boolean;
    data?: T;
    error?: string;
  }

  /**
   * Navigate tool for browser navigation
   */
  export const Navigate: {
    /**
     * Navigate to a URL
     * @param url URL to navigate to
     * @param options Navigation options
     */
    to: (url: string, options?: object) => Promise<Result<{
      url: string;
      previousUrl: string;
      timestamp: string;
      loadSuccess?: boolean;
    }>>;

    /**
     * Navigate browser history (back, forward, refresh)
     * @param direction Direction: "back", "forward", or "refresh"
     * @param options Navigation options
     */
    history: (direction: 'back' | 'forward' | 'refresh', options?: object) => Promise<Result<{
      previousUrl: string;
      previousTitle: string;
      direction: string;
      timestamp: string;
    }>>;

    /**
     * Get current browser navigation state
     */
    getState: () => Result<{
      url: string;
      title: string;
      historyLength: number;
      canGoBack: boolean;
      timestamp: string;
    }>;
  };

  /**
   * Extract tool for DOM element extraction
   */
  export const Extract: {
    /**
     * Extract elements and data from the DOM
     * @param query CSS selector, XPath, or text pattern
     * @param options Extraction options
     */
    elements: (query: string, options?: {
      queryType?: 'css' | 'xpath' | 'text';
      visible?: boolean;
      inViewport?: boolean;
      limit?: number;
      extract?: {
        text?: boolean;
        html?: boolean;
        attributes?: string[];
        styles?: string[];
        state?: boolean;
      };
    }) => Result<{
      query: string;
      queryType: string;
      count: number;
      totalMatches: number;
      elements: Array<{
        tag: string;
        xpath: string;
        text?: string;
        html?: string;
        position?: {
          x: number;
          y: number;
          width: number;
          height: number;
          inViewport: boolean;
        };
        attributes?: Record<string, string>;
        styles?: Record<string, string>;
        state?: object;
      }>;
    }>;

    /**
     * Extract page metadata and context
     */
    pageInfo: () => Result<{
      url: string;
      title: string;
      metadata: Record<string, string>;
      elementCounts: Record<string, number>;
      viewport: {
        width: number;
        height: number;
        scrollX: number;
        scrollY: number;
        devicePixelRatio: number;
      };
      document: {
        width: number;
        height: number;
      };
      timestamp: string;
    }>;
  };

  /**
   * Visualize tool for page visualization
   */
  export const Visualize: {
    /**
     * Take a screenshot of the page or element
     * @param options Screenshot options
     */
    screenshot: (options?: {
      element?: string;
      fullPage?: boolean;
    }) => Promise<Result<{
      type: 'screenshot';
      timestamp: string;
      url: string;
      title: string;
      fullPage: boolean;
      viewport: object;
      element?: object;
      imageData: string;
    }>>;

    /**
     * Get accessibility tree information
     * @param options Accessibility options
     */
    accessibilityTree: (options?: {
      root?: string;
      depth?: number;
    }) => Result<{
      type: 'accessibilityTree';
      timestamp: string;
      url: string;
      title: string;
      tree: object;
    }>;

    /**
     * Get DOM structure visualization
     * @param options DOM structure options
     */
    domStructure: (options?: {
      root?: string;
      depth?: number;
    }) => Result<{
      type: 'domStructure';
      timestamp: string;
      url: string;
      title: string;
      structure: object;
    }>;

    /**
     * Get a detailed snapshot of the page
     * @param options Snapshot options
     */
    snapshot: (options?: object) => Result<{
      type: 'snapshot';
      timestamp: string;
      url: string;
      title: string;
      snapshot: object;
    }>;
  };

  /**
   * Perform tool for user actions
   */
  export const Perform: {
    /**
     * Click an element
     * @param target CSS selector or XPath of element to click
     * @param options Click options
     */
    click: (target: string, options?: {
      waitForNavigation?: boolean;
      waitForSelector?: string;
      rightClick?: boolean;
      timeout?: number;
    }) => Promise<Result<{
      action: string;
      element: object;
      url: string;
      timestamp: string;
    }>>;

    /**
     * Type text into an element
     * @param target CSS selector or XPath of element
     * @param text Text to type
     * @param options Typing options
     */
    type: (target: string, text: string, options?: {
      clear?: boolean;
      delay?: number;
    }) => Promise<Result<{
      action: string;
      element: object;
      text: string;
      textLength: number;
      timestamp: string;
    }>>;

    /**
     * Select an option from a dropdown
     * @param target CSS selector or XPath of select element
     * @param value Option value(s) or text to select
     * @param options Selection options
     */
    select: (target: string, value: string | string[], options?: {
      byText?: boolean;
      multiple?: boolean;
    }) => Result<{
      action: string;
      element: object;
      selections: Array<{
        value: string;
        text: string;
        partialMatch?: boolean;
      }>;
      errors?: string[];
      timestamp: string;
    }>;

    /**
     * Hover over an element
     * @param target CSS selector or XPath of element
     * @param options Hover options
     */
    hover: (target: string, options?: {
      duration?: number;
    }) => Promise<Result<{
      action: string;
      element: object;
      duration: number;
      timestamp: string;
    }>>;

    /**
     * Scroll page or element
     * @param options Scroll options
     */
    scroll: (options?: {
      target?: string;
      x?: number;
      y?: number;
      behavior?: 'auto' | 'smooth';
    }) => Result<{
      action: string;
      element?: object;
      x?: number;
      y?: number;
      behavior: string;
      timestamp: string;
    }>;
  };

  // Original functions still available
  export function getXPath(element: Element): string;
  export function findElementByXPath(xpath: string): Element | null;
  export function takeSnapshot(options?: object): object;
  export function snapshotToPageContext(snapshot: object): object;
  export function isElementVisible(element: Element): boolean;
  export function getVisibleText(element: Element): string;
  export function inViewport(element: Element): boolean;
  export function visualizeSnapshot(snapshot: object, options?: object): string;
}