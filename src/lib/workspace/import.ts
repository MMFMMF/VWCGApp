/**
 * Workspace import functionality
 *
 * Imports and validates workspace data from .vwcg or .json files
 */

import type { WorkspaceState } from '../../types/workspace';
import { WORKSPACE_VERSION } from '../../types/workspace';

/**
 * Validation error details
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Import result with validation
 */
export interface ImportResult {
  success: boolean;
  workspace?: WorkspaceState;
  errors?: ValidationError[];
}

/**
 * Validate workspace structure
 *
 * @param data - Raw data to validate
 * @returns Array of validation errors (empty if valid)
 */
function validateWorkspace(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'root',
      message: 'Invalid workspace data: must be an object',
    });
    return errors;
  }

  // Validate meta
  if (!data.meta || typeof data.meta !== 'object') {
    errors.push({
      field: 'meta',
      message: 'Missing or invalid metadata',
    });
  } else {
    if (!data.meta.id || typeof data.meta.id !== 'string') {
      errors.push({
        field: 'meta.id',
        message: 'Missing or invalid workspace ID',
      });
    }
    if (!data.meta.createdAt || typeof data.meta.createdAt !== 'string') {
      errors.push({
        field: 'meta.createdAt',
        message: 'Missing or invalid creation date',
      });
    }
    if (!data.meta.updatedAt || typeof data.meta.updatedAt !== 'string') {
      errors.push({
        field: 'meta.updatedAt',
        message: 'Missing or invalid update date',
      });
    }
    if (
      data.meta.version === undefined ||
      typeof data.meta.version !== 'number'
    ) {
      errors.push({
        field: 'meta.version',
        message: 'Missing or invalid version number',
      });
    }
  }

  // Validate tools
  if (data.tools === undefined || typeof data.tools !== 'object') {
    errors.push({
      field: 'tools',
      message: 'Missing or invalid tools data',
    });
  }

  // Validate insights
  if (!Array.isArray(data.insights)) {
    errors.push({
      field: 'insights',
      message: 'Insights must be an array',
    });
  } else {
    data.insights.forEach((insight: any, index: number) => {
      if (!insight.id || typeof insight.id !== 'string') {
        errors.push({
          field: `insights[${index}].id`,
          message: 'Insight missing valid ID',
        });
      }
      if (!insight.content || typeof insight.content !== 'string') {
        errors.push({
          field: `insights[${index}].content`,
          message: 'Insight missing valid content',
        });
      }
      if (!insight.sourceToolId || typeof insight.sourceToolId !== 'string') {
        errors.push({
          field: `insights[${index}].sourceToolId`,
          message: 'Insight missing valid source tool ID',
        });
      }
    });
  }

  // Validate synthesis
  if (!data.synthesis || typeof data.synthesis !== 'object') {
    errors.push({
      field: 'synthesis',
      message: 'Missing or invalid synthesis data',
    });
  } else {
    if (typeof data.synthesis.completed !== 'boolean') {
      errors.push({
        field: 'synthesis.completed',
        message: 'Synthesis completed flag must be a boolean',
      });
    }
  }

  return errors;
}

/**
 * Import workspace from JSON string
 *
 * @param jsonString - JSON string containing workspace data
 * @returns Import result with validation
 */
export function importWorkspaceFromJSON(jsonString: string): ImportResult {
  try {
    // Parse JSON
    const data = JSON.parse(jsonString);

    // Validate structure
    const errors = validateWorkspace(data);
    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    // Check version compatibility
    if (data.meta.version > WORKSPACE_VERSION) {
      return {
        success: false,
        errors: [
          {
            field: 'meta.version',
            message: `This workspace was created with a newer version (v${data.meta.version}). Current version is v${WORKSPACE_VERSION}. Please update the application.`,
          },
        ],
      };
    }

    // Return validated workspace
    return {
      success: true,
      workspace: data as WorkspaceState,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: 'json',
          message:
            error instanceof Error
              ? `Failed to parse JSON: ${error.message}`
              : 'Failed to parse JSON file',
        },
      ],
    };
  }
}

/**
 * Import workspace from File object
 *
 * @param file - File object from file input
 * @returns Promise resolving to import result
 */
export async function importWorkspaceFromFile(
  file: File
): Promise<ImportResult> {
  try {
    // Validate file extension
    const validExtensions = ['.vwcg', '.json'];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      return {
        success: false,
        errors: [
          {
            field: 'file',
            message: `Invalid file type. Please select a .vwcg or .json file.`,
          },
        ],
      };
    }

    // Read file as text
    const text = await file.text();

    // Import from JSON string
    return importWorkspaceFromJSON(text);
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          field: 'file',
          message:
            error instanceof Error
              ? `Failed to read file: ${error.message}`
              : 'Failed to read file',
        },
      ],
    };
  }
}

/**
 * Check if a file is a valid workspace file
 *
 * Quick validation without full parsing
 *
 * @param file - File object to check
 * @returns Promise resolving to boolean
 */
export async function isValidWorkspaceFile(file: File): Promise<boolean> {
  const result = await importWorkspaceFromFile(file);
  return result.success;
}

/**
 * Format validation errors for display
 *
 * @param errors - Array of validation errors
 * @returns Formatted error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  const lines = ['Invalid workspace file:'];
  errors.forEach((error) => {
    lines.push(`- ${error.field}: ${error.message}`);
  });

  return lines.join('\n');
}
