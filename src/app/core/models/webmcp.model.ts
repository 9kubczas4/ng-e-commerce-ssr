import { Category, Product } from './product.model';

/**
 * JSON Schema property definition for WebMCP tool parameters
 */
export interface JSONSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  oneOf?: Array<{ const: string; title: string }>;
  title?: string;
}

/**
 * JSON Schema definition for WebMCP tool input validation
 */
export interface JSONSchema {
  type: 'object';
  properties: Record<string, JSONSchemaProperty>;
  required?: string[];
}

/**
 * WebMCP tool registration interface
 */
export interface ToolRegistration {
  name: string;
  description: string;
  inputSchema: JSONSchema;
  annotations?: Record<string, string>;
  execute: (params: unknown) => Promise<ToolResponse>;
}

/**
 * Tool execution response structure
 */
export interface ToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * Error object for tool execution failures
 */
export interface ErrorObject {
  error: string;
  details?: unknown;
  code?: string;
}

/**
 * Tool error response structure
 */
export interface ToolErrorResponse {
  content: Array<{
    type: 'text';
    text: string; // JSON stringified ErrorObject
  }>;
}

/**
 * Parameters for search_product tool
 */
export interface SearchProductParams {
  query?: string;
  category?: Category;
}

/**
 * Response from search_product tool
 */
export interface SearchProductResponse {
  products: Product[];
  count: number;
  message: string;
}

/**
 * Parameters for add_product_to_basket tool
 */
export interface AddToBasketParams {
  productId: string;
}

/**
 * Response from add_product_to_basket tool
 */
export interface AddToBasketResponse {
  success: boolean;
  message: string;
  basket: {
    itemCount: number;
    totalPrice: number;
  };
}

/**
 * Response from proceed_checkout tool (no parameters needed)
 */
export interface ProceedCheckoutResponse {
  success: boolean;
  message: string;
  navigated: boolean;
}

/**
 * Parameters for toggle_theme tool
 */
export interface ToggleThemeParams {
  theme?: 'light' | 'dark' | 'toggle';
}

/**
 * Response from toggle_theme tool
 */
export interface ToggleThemeResponse {
  success: boolean;
  message: string;
  currentTheme: 'light' | 'dark';
}

/**
 * Parameters for manage_basket_quantity tool
 */
export interface ManageBasketQuantityParams {
  productId: string;
  quantity: number;
}

/**
 * Response from manage_basket_quantity tool
 */
export interface ManageBasketQuantityResponse {
  success: boolean;
  message: string;
  productId: string;
  newQuantity: number;
  basket: {
    itemCount: number;
    totalPrice: number;
  };
}

/**
 * Extended SubmitEvent interface for WebMCP Declarative API
 * Includes agentInvoked flag and respondWith method for agent interactions
 */
export interface AgentSubmitEvent extends SubmitEvent {
  agentInvoked?: boolean;
  respondWith?: (promise: Promise<unknown>) => void;
}
