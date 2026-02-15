/**
 * Tool Registry - Singleton registry for dynamic tool registration
 *
 * Enables tools to self-register and provides methods for retrieval,
 * filtering, and sorting tools.
 */

import type { ToolDefinition } from '../../types/tool';

/**
 * Registry class for managing tool definitions
 */
class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  /**
   * Register a new tool
   * @param tool - Tool definition to register
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.metadata.id)) {
      console.warn(`Tool ${tool.metadata.id} already registered, overwriting`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  /**
   * Unregister a tool
   * @param id - Tool ID to remove
   */
  unregister(id: string): void {
    this.tools.delete(id);
  }

  /**
   * Get a specific tool by ID
   * @param id - Tool ID
   * @returns Tool definition or undefined if not found
   */
  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  /**
   * Get all registered tools
   * @returns Array of all tool definitions
   */
  getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools filtered by category
   * @param category - Tool category to filter by
   * @returns Array of tools in the category
   */
  getByCategory(category: string): ToolDefinition[] {
    return this.getAll().filter(tool => tool.metadata.category === category);
  }

  /**
   * Get all tools sorted by order
   * @returns Array of tools sorted by metadata.order
   */
  getSorted(): ToolDefinition[] {
    return this.getAll().sort((a, b) => a.metadata.order - b.metadata.order);
  }

  /**
   * Get all tool IDs
   * @returns Array of tool ID strings
   */
  getIds(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if a tool is registered
   * @param id - Tool ID to check
   * @returns True if tool exists
   */
  has(id: string): boolean {
    return this.tools.has(id);
  }

  /**
   * Get count of registered tools
   * @returns Number of tools in registry
   */
  count(): number {
    return this.tools.size;
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();
