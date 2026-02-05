import { useState, useEffect, useMemo } from 'react';
import type { ToolProps, ValidationResult, PDFSection } from '@types/tool';
import { toolRegistry } from '@lib/tools';
import { useWorkspaceStore } from '@stores/workspaceStore';
import { generatePDFReport, getReportFilename } from '@lib/pdf/generator';
import {
  Card,
  CardHeader,
  CardTitle,
  Button,
  Badge
} from '@components/shared';

interface ReportCenterData {
  selectedSections: string[];
  includeInsights: boolean;
  lastGenerated: number | null;
}

const defaultData: ReportCenterData = {
  selectedSections: [],
  includeInsights: true,
  lastGenerated: null
};

export default function ReportCenterTool({ data, onUpdate, readonly = false }: ToolProps) {
  const [formData, setFormData] = useState<ReportCenterData>(
    (data as ReportCenterData) || defaultData
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workspaceState = useWorkspaceStore(state => state);
  const synthesisResult = useWorkspaceStore(state => state.synthesisResult);
  const allTools = toolRegistry.getAll();

  useEffect(() => {
    if (data) setFormData(data as ReportCenterData);
  }, [data]);

  // Get exportable tools (exclude report center itself and insights dashboard)
  const exportableTools = useMemo(() => {
    return allTools
      .filter(t => t.metadata.id !== 'report-center' && t.metadata.id !== 'insights-dashboard')
      .map(tool => {
        const toolData = workspaceState.tools[tool.metadata.id as keyof typeof workspaceState.tools];
        const hasData = toolData && toolData.completed;
        let pdfExport = null;

        if (hasData && tool.exportToPDF) {
          try {
            pdfExport = tool.exportToPDF(toolData.data);
          } catch (e) {
            console.error(`Failed to get PDF export for ${tool.metadata.id}:`, e);
          }
        }

        return {
          id: tool.metadata.id,
          name: tool.metadata.name,
          category: tool.metadata.category,
          hasData,
          pdfExport
        };
      })
      .sort((a, b) => {
        // Sort by category then by name
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.name.localeCompare(b.name);
      });
  }, [allTools, workspaceState.tools]);

  // Auto-select all tools with data on first load
  useEffect(() => {
    if (formData.selectedSections.length === 0) {
      const withData = exportableTools.filter(t => t.hasData).map(t => t.id);
      if (withData.length > 0) {
        const updated = { ...formData, selectedSections: withData };
        setFormData(updated);
        onUpdate?.(updated);
      }
    }
  }, [exportableTools]);

  const toggleSection = (toolId: string) => {
    const updated = {
      ...formData,
      selectedSections: formData.selectedSections.includes(toolId)
        ? formData.selectedSections.filter(id => id !== toolId)
        : [...formData.selectedSections, toolId]
    };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const selectAll = () => {
    const allWithData = exportableTools.filter(t => t.hasData).map(t => t.id);
    const updated = { ...formData, selectedSections: allWithData };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const selectNone = () => {
    const updated = { ...formData, selectedSections: [] };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const toggleInsights = () => {
    const updated = { ...formData, includeInsights: !formData.includeInsights };
    setFormData(updated);
    onUpdate?.(updated);
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const sections = exportableTools
        .filter(t => formData.selectedSections.includes(t.id))
        .map(t => {
          const toolData = workspaceState.tools[t.id as keyof typeof workspaceState.tools];
          return {
            toolId: t.id,
            toolName: t.name,
            enabled: true,
            data: toolData?.data,
            pdfExport: t.pdfExport
          };
        });

      const blob = await generatePDFReport({
        workspaceName: workspaceState.meta.name || 'Workspace',
        companyName: workspaceState.meta.name || '',
        generatedAt: new Date(),
        sections,
        synthesisResult: formData.includeInsights ? synthesisResult : undefined,
        includeInsights: formData.includeInsights
      });

      // Download the PDF (RPT-04)
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getReportFilename(workspaceState.meta.name || 'Workspace');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Update last generated
      const updated = { ...formData, lastGenerated: Date.now() };
      setFormData(updated);
      onUpdate?.(updated);
    } catch (e) {
      console.error('PDF generation failed:', e);
      setError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Statistics
  const stats = {
    totalTools: exportableTools.length,
    withData: exportableTools.filter(t => t.hasData).length,
    selected: formData.selectedSections.length,
    insightCount: synthesisResult?.insights.length || 0
  };

  // Group tools by category
  const toolsByCategory = useMemo(() => {
    const grouped: Record<string, typeof exportableTools> = {};
    exportableTools.forEach(tool => {
      if (!grouped[tool.category]) grouped[tool.category] = [];
      grouped[tool.category].push(tool);
    });
    return grouped;
  }, [exportableTools]);

  const categoryLabels: Record<string, string> = {
    assessment: 'Assessment Tools',
    planning: 'Planning Tools',
    synthesis: 'Analysis Tools',
    sop: 'Process Tools'
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Report Center</h3>
            <p className="text-sm text-gray-500">
              Generate a comprehensive PDF report of your assessments
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">{stats.selected}</div>
            <div className="text-xs text-gray-500">sections selected</div>
          </div>
        </div>

        {formData.lastGenerated && (
          <div className="mt-4 text-sm text-gray-500">
            Last report generated: {new Date(formData.lastGenerated).toLocaleString()}
          </div>
        )}
      </Card>

      {/* Section Selection (RPT-01) */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Select Report Sections</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="secondary" onClick={selectNone}>
                Clear
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-6">
          {Object.entries(toolsByCategory).map(([category, tools]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {categoryLabels[category] || category}
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {tools.map(tool => (
                  <label
                    key={tool.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.selectedSections.includes(tool.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${!tool.hasData ? 'opacity-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedSections.includes(tool.id)}
                      onChange={() => toggleSection(tool.id)}
                      disabled={!tool.hasData || readonly}
                      className="rounded text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{tool.name}</div>
                      {!tool.hasData && (
                        <div className="text-xs text-gray-400">No data yet</div>
                      )}
                    </div>
                    {tool.hasData && (
                      <Badge variant="success" size="sm">Ready</Badge>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Synthesis Insights Option */}
      <Card>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.includeInsights}
            onChange={toggleInsights}
            disabled={readonly}
            className="rounded text-indigo-600"
          />
          <div className="flex-1">
            <div className="font-medium">Include Synthesis Insights</div>
            <div className="text-sm text-gray-500">
              Add cross-tool analysis findings to the report
            </div>
          </div>
          {stats.insightCount > 0 && (
            <Badge variant="warning">{stats.insightCount} insights</Badge>
          )}
        </label>
      </Card>

      {/* Preview & Generate */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
        </CardHeader>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="text-sm space-y-1">
            <div><strong>Workspace:</strong> {workspaceState.meta.name || 'Unnamed'}</div>
            <div><strong>Sections:</strong> {stats.selected} of {stats.withData} available</div>
            {formData.includeInsights && (
              <div><strong>Insights:</strong> {stats.insightCount} synthesis findings</div>
            )}
            <div><strong>Format:</strong> PDF (A4 Portrait)</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button (RPT-02, RPT-03, RPT-04) */}
        <Button
          variant="primary"
          onClick={generateReport}
          disabled={isGenerating || stats.selected === 0 || readonly}
          className="w-full"
        >
          {isGenerating ? (
            <>Generating PDF...</>
          ) : (
            <>Download Report ({stats.selected} sections)</>
          )}
        </Button>

        {stats.selected === 0 && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Select at least one section to generate a report
          </p>
        )}
      </Card>
    </div>
  );
}

// Validation
export function validateReportCenter(data: unknown): ValidationResult {
  return { valid: true, errors: [], warnings: [] };
}

// PDF Export (meta - this tool doesn't export itself)
export function exportReportCenterToPDF(): PDFSection {
  return {
    title: 'Report Center',
    summary: 'Report generation tool',
    tables: [],
    insights: [],
    rawData: {}
  };
}

// Register
toolRegistry.register({
  metadata: {
    id: 'report-center',
    name: 'Report Center',
    description: 'Generate and download comprehensive PDF reports',
    category: 'synthesis',
    order: 11,
    estimatedTime: 2
  },
  component: ReportCenterTool,
  validate: validateReportCenter,
  exportToPDF: exportReportCenterToPDF,
  getDefaultData: () => defaultData
});
