/**
 * BrowserMagic DOM Library TypeScript Definitions
 */

/**
 * Default configuration options for DOM snapshots
 */
export interface SnapshotOptions {
  /**
   * Whether to include document title (default: true)
   */
  includeTitle?: boolean;
  
  /**
   * Whether to include meta tags (default: true)
   */
  includeMetadata?: boolean;
  
  /**
   * Whether to include viewport dimensions (default: true)
   */
  includeViewportInfo?: boolean;
  
  /**
   * Whether to capture elements outside viewport (default: true)
   */
  captureOutOfViewport?: boolean;
  
  /**
   * Whether to include element position information (default: true)
   */
  includePosition?: boolean;
  
  /**
   * Whether to traverse shadow DOM (default: true)
   */
  includeShadowDOM?: boolean;
  
  /**
   * Optional list of tag names to focus on
   */
  elementFilter?: string[];
  
  /**
   * Maximum length of text content to capture (default: 60)
   */
  textTruncateLength?: number;
}

/**
 * Element Snapshot
 */
export interface ElementSnapshot {
  /**
   * Element's tag name
   */
  tag: string;
  
  /**
   * XPath to the element
   */
  xpath: string;
  
  /**
   * Visible text content
   */
  text: string;
  
  /**
   * X coordinate relative to viewport
   */
  x?: number;
  
  /**
   * Y coordinate relative to viewport
   */
  y?: number;
  
  /**
   * Element width
   */
  width?: number;
  
  /**
   * Element height
   */
  height?: number;
  
  /**
   * Whether element is in the viewport
   */
  inViewport: boolean;
}

/**
 * Viewport information
 */
export interface ViewportInfo {
  /**
   * Viewport width
   */
  width: number;
  
  /**
   * Viewport height
   */
  height: number;
  
  /**
   * Horizontal scroll position
   */
  scrollX: number;
  
  /**
   * Vertical scroll position
   */
  scrollY: number;
}

/**
 * Page Snapshot
 */
export interface PageSnapshot {
  /**
   * Current page URL
   */
  url: string;
  
  /**
   * ISO timestamp when snapshot was taken
   */
  timestamp: string;
  
  /**
   * Page title (if includeTitle is true)
   */
  title?: string;
  
  /**
   * Page metadata (if includeMetadata is true)
   */
  metadata?: Record<string, string>;
  
  /**
   * Viewport dimensions (if includeViewportInfo is true)
   */
  viewport?: ViewportInfo;
  
  /**
   * Captured DOM elements information
   */
  keyElements: ElementSnapshot[];
}

/**
 * Take a snapshot of key elements on the page
 * @param options - Options for the snapshot
 * @returns Snapshot object with key elements and page information
 */
export function takeSnapshot(options?: SnapshotOptions): PageSnapshot;

/**
 * Generate an XPath for a DOM element
 * @param element - The DOM element to generate XPath for
 * @returns XPath expression for the element
 */
export function getXPath(element: Element): string;

/**
 * Find an element in the DOM using its XPath
 * @param xpath - XPath to the element
 * @returns Found element or null if not found
 */
export function findElementByXPath(xpath: string): Element | null;

/**
 * Check if an element is in the viewport
 * @param rect - Element's bounding rect {x, y, width, height}
 * @returns Whether the element is in the viewport
 */
export function inViewport(rect: { x: number, y: number, width: number, height: number }): boolean;

/**
 * Check if an element is visible
 * @param element - DOM element to check
 * @returns Whether the element is visible
 */
export function isElementVisible(element: Element): boolean;

/**
 * Get visible text content of an element
 * @param node - The node to extract text from
 * @returns Visible text content
 */
export function getVisibleText(node: Node): string;

/**
 * Convert a page snapshot to a simplified format
 * @param snapshot - The page snapshot to convert
 * @returns Simplified page context object
 */
export function snapshotToPageContext(snapshot: PageSnapshot): object;

/**
 * Create a visual representation of a snapshot for debugging
 * @param snapshot - The page snapshot
 * @returns HTML string representing the snapshot
 */
export function visualizeSnapshot(snapshot: PageSnapshot): string;