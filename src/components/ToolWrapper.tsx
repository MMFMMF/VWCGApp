/**
 * Tool Wrapper Component
 *
 * Connects tool components to Zustand store, handling:
 * - Data loading from store
 * - Update callbacks
 * - Default data initialization
 * - Loading states
 * - Tool metadata display
 */

import { Suspense, useState } from 'react';
import { useWorkspaceStore } from '../stores/workspaceStore';
import { generateSingleToolPDF, getSingleToolReportFilename } from '../lib/pdf/singleToolReport';
import type { ToolDefinition } from '../types/tool';

interface Props {
  /** Tool definition from registry */
  tool: ToolDefinition;
  /** Whether tool is in read-only mode */
  readonly?: boolean;
}

/**
 * Loading fallback shown while tool component loads
 */
function ToolLoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}

/**
 * Tool wrapper that connects tools to state management
 */
export function ToolWrapper({ tool, readonly = false }: Props) {
  // Get tool data and update function from store
  const toolData = useWorkspaceStore((state) => state.tools[tool.metadata.id as any]);
  const updateToolData = useWorkspaceStore((state) => state.updateToolData);

  // Get the tool component
  const Component = tool.component;

  // Initialize with default data if not present
  const data = toolData?.data ?? (tool.getDefaultData?.() || {});

  // Create update callback that updates the store
  const handleUpdate = (newData: Record<string, unknown>) => {
    updateToolData(tool.metadata.id as any, {
      data: newData,
      completed: false, // Will be set to true by tool when validation passes
    });
  };

  // PDF export state and handler
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleExportPDF = async () => {
    if (!tool.exportToPDF || isGeneratingPDF) return;

    setIsGeneratingPDF(true);
    try {
      const pdfSection = tool.exportToPDF(data);
      const blob = await generateSingleToolPDF({
        toolName: tool.metadata.name,
        pdfSection,
        generatedAt: new Date()
      });

      // Trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = getSingleToolReportFilename(tool.metadata.name, new Date());
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Show PDF button only for assessment tools with exportToPDF and actual data
  const showPDFButton =
    !!tool.exportToPDF &&
    tool.metadata.category !== 'synthesis' &&
    tool.metadata.id !== 'report-center' &&
    toolData !== undefined &&
    Object.keys(data).length > 0;

  return (
    <div className="tool-container">
      {/* Tool header with metadata */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tool.metadata.name}</h1>
          <p className="mt-1 text-gray-600">{tool.metadata.description}</p>
          {tool.metadata.estimatedTime && (
            <span className="text-sm text-gray-500">
              Estimated time: {tool.metadata.estimatedTime} minutes
            </span>
          )}
        </div>
        {showPDFButton && (
          <button
            onClick={handleExportPDF}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shrink-0"
            title="Download PDF Report"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
          </button>
        )}
      </header>

      {/* Tool component wrapped in Suspense for lazy loading */}
      <Suspense fallback={<ToolLoadingFallback />}>
        <Component
          data={data}
          onUpdate={handleUpdate}
          readonly={readonly}
        />
      </Suspense>
    </div>
  );
}
