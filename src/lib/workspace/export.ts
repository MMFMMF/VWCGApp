/**
 * Workspace export functionality
 *
 * Exports workspace data as a downloadable .vwcg file
 */

import type { WorkspaceState } from '../../types/workspace';

/**
 * Export workspace to a .vwcg file
 *
 * @param workspace - The workspace state to export
 * @param filename - Optional custom filename (without extension)
 * @returns void - Triggers browser download
 */
export function exportWorkspace(
  workspace: WorkspaceState,
  filename?: string
): void {
  try {
    // Generate filename if not provided
    const workspaceName = workspace.meta.name || 'workspace';
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const finalFilename = filename || `${workspaceName}-${timestamp}`;

    // Convert workspace to JSON string
    const jsonString = JSON.stringify(workspace, null, 2);

    // Create blob
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${finalFilename}.vwcg`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to export workspace:', error);
    throw new Error('Failed to export workspace. Please try again.');
  }
}

/**
 * Export workspace as JSON string
 *
 * Useful for copying to clipboard or sending via API
 *
 * @param workspace - The workspace state to export
 * @param pretty - Whether to format with indentation
 * @returns JSON string representation
 */
export function exportWorkspaceAsJSON(
  workspace: WorkspaceState,
  pretty: boolean = true
): string {
  try {
    return JSON.stringify(workspace, null, pretty ? 2 : 0);
  } catch (error) {
    console.error('Failed to serialize workspace:', error);
    throw new Error('Failed to serialize workspace data.');
  }
}

/**
 * Generate a shareable workspace summary
 *
 * Creates a human-readable text summary of the workspace
 *
 * @param workspace - The workspace state to summarize
 * @returns Formatted text summary
 */
export function generateWorkspaceSummary(workspace: WorkspaceState): string {
  const { meta, tools, insights, synthesis } = workspace;

  const lines: string[] = [];

  // Header
  lines.push('='.repeat(60));
  lines.push('VWCG WORKSPACE SUMMARY');
  lines.push('='.repeat(60));
  lines.push('');

  // Metadata
  lines.push('WORKSPACE DETAILS');
  lines.push('-'.repeat(60));
  if (meta.name) lines.push(`Name: ${meta.name}`);
  if (meta.description) lines.push(`Description: ${meta.description}`);
  lines.push(`Created: ${new Date(meta.createdAt).toLocaleString()}`);
  lines.push(`Last Updated: ${new Date(meta.updatedAt).toLocaleString()}`);
  lines.push(`Version: ${meta.version}`);
  lines.push('');

  // Tools
  lines.push('COMPLETED TOOLS');
  lines.push('-'.repeat(60));
  const completedTools = Object.entries(tools).filter(
    ([_, data]) => data?.completed
  );
  if (completedTools.length === 0) {
    lines.push('No tools completed yet.');
  } else {
    completedTools.forEach(([toolId, data]) => {
      lines.push(`- ${toolId}`);
      if (data?.lastRun) {
        lines.push(`  Last run: ${new Date(data.lastRun).toLocaleString()}`);
      }
    });
  }
  lines.push('');

  // Insights
  lines.push('INSIGHTS');
  lines.push('-'.repeat(60));
  if (insights.length === 0) {
    lines.push('No insights generated yet.');
  } else {
    lines.push(`Total insights: ${insights.length}`);
    insights.forEach((insight, index) => {
      lines.push(`\n${index + 1}. [${insight.sourceToolId}] ${insight.content}`);
      if (insight.priority) {
        lines.push(`   Priority: ${insight.priority}`);
      }
      if (insight.tags && insight.tags.length > 0) {
        lines.push(`   Tags: ${insight.tags.join(', ')}`);
      }
    });
  }
  lines.push('');

  // Synthesis
  if (synthesis.completed) {
    lines.push('SYNTHESIS');
    lines.push('-'.repeat(60));
    if (synthesis.summary) {
      lines.push('Summary:');
      lines.push(synthesis.summary);
      lines.push('');
    }
    if (synthesis.keyFindings && synthesis.keyFindings.length > 0) {
      lines.push('Key Findings:');
      synthesis.keyFindings.forEach((finding, index) => {
        lines.push(`${index + 1}. ${finding}`);
      });
      lines.push('');
    }
    if (synthesis.recommendations && synthesis.recommendations.length > 0) {
      lines.push('Recommendations:');
      synthesis.recommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec}`);
      });
    }
  }

  lines.push('');
  lines.push('='.repeat(60));

  return lines.join('\n');
}
