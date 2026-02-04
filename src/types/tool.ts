/**
 * Type definitions for tool registry pattern
 *
 * These types define the standardized interface for all assessment tools,
 * including metadata, props, validation, and PDF export capabilities.
 */

import { ComponentType } from 'react';

/**
 * Metadata describing a tool
 */
export interface ToolMetadata {
  /** Unique identifier for the tool */
  id: string;
  /** Display name */
  name: string;
  /** Description shown in tool lists */
  description: string;
  /** Category for grouping tools */
  category: 'assessment' | 'planning' | 'sop' | 'synthesis';
  /** Sort order in lists */
  order: number;
  /** Optional icon identifier */
  icon?: string;
  /** Estimated completion time in minutes */
  estimatedTime?: number;
}

/**
 * Props passed to tool components
 */
export interface ToolProps {
  /** Current tool data from store */
  data?: Record<string, unknown>;
  /** Callback to update tool data */
  onUpdate?: (data: Record<string, unknown>) => void;
  /** Whether tool is in read-only mode */
  readonly?: boolean;
}

/**
 * Result of tool data validation
 */
export interface ValidationResult {
  /** Whether data is valid */
  valid: boolean;
  /** Validation error messages */
  errors: string[];
  /** Non-blocking warnings */
  warnings?: string[];
}

/**
 * Chart data structure for visualizations
 */
export interface ChartData {
  /** Chart type */
  type: 'radar' | 'bar' | 'line' | 'pie';
  /** Chart data points */
  data: Array<{ label: string; value: number; [key: string]: unknown }>;
  /** Additional chart options */
  options?: Record<string, unknown>;
}

/**
 * Table data structure for reports
 */
export interface TableData {
  /** Table column headers */
  headers: string[];
  /** Table row data */
  rows: string[][];
}

/**
 * PDF section generated from tool data
 */
export interface PDFSection {
  /** Section title */
  title: string;
  /** Optional summary text */
  summary?: string;
  /** Charts to include */
  charts?: ChartData[];
  /** Tables to include */
  tables?: TableData[];
  /** Key insights */
  insights?: string[];
  /** Raw data for debugging */
  rawData?: Record<string, unknown>;
}

/**
 * Complete tool definition
 */
export interface ToolDefinition {
  /** Tool metadata */
  metadata: ToolMetadata;
  /** React component for the tool */
  component: ComponentType<ToolProps>;
  /** Optional validation function */
  validate?: (data: unknown) => ValidationResult;
  /** Optional PDF export function */
  exportToPDF?: (data: unknown) => PDFSection;
  /** Optional function to get default data */
  getDefaultData?: () => Record<string, unknown>;
}
