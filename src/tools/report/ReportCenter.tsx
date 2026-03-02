import React, { useState, useCallback, useMemo } from 'react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { Button } from '@/components/ui/Button';
import { FileDown, Loader2, BookOpen, FileText, AlertTriangle, Sparkles, Printer } from 'lucide-react';
import { cn } from '@/utils/cn';

// New report system imports
import { UnifiedStrategicBriefing, LLMStrategicBriefing } from '@/report/unified';
import {
  AIReadinessReport,
  LeadershipDNAReport,
  SwotReport,
  VisionCanvasReport,
  AdvisorReadinessReport,
  RoadmapReport,
} from '@/report/individual';
import { savePdf, printReport } from '@/report/pdf';
import type { ReportType } from '@/report/pdf';
import { detectEdgeCases } from '@/report/quality';
import { assemblePayload, generateWithRetry } from '@/engine/llm';
import type { BriefingNarrative, QAValidationResult } from '@/engine/llm';

type ReportMode = 'strategic-briefing' | 'ai-briefing' | 'individual';

interface IndividualReportMapping {
  toolId: string;
  label: string;
  reportType: ReportType;
  Component: React.ComponentType;
}

const INDIVIDUAL_REPORT_MAP: IndividualReportMapping[] = [
  {
    toolId: 'ai-readiness',
    label: 'AI Readiness Assessment',
    reportType: 'ai-readiness',
    Component: AIReadinessReport,
  },
  {
    toolId: 'leadership-dna',
    label: 'Leadership DNA',
    reportType: 'leadership-dna',
    Component: LeadershipDNAReport,
  },
  {
    toolId: 'swot',
    label: 'SWOT Analysis',
    reportType: 'swot',
    Component: SwotReport,
  },
  {
    toolId: 'vision-canvas',
    label: 'Vision Canvas',
    reportType: 'vision-canvas',
    Component: VisionCanvasReport,
  },
  {
    toolId: 'advisor-readiness',
    label: 'Advisor Readiness',
    reportType: 'advisor-readiness',
    Component: AdvisorReadinessReport,
  },
  {
    toolId: 'roadmap',
    label: '90-Day Roadmap',
    reportType: 'roadmap',
    Component: RoadmapReport,
  },
];

export const ReportCenter: React.FC = () => {
  const { tools, metadata } = useWorkspaceStore();
  const [reportMode, setReportMode] = useState<ReportMode>('strategic-briefing');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // LLM state
  const [llmNarrative, setLlmNarrative] = useState<BriefingNarrative | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [llmGenerating, setLlmGenerating] = useState(false);
  const [llmQaResult, setLlmQaResult] = useState<QAValidationResult | null>(null);
  const [llmNeedsReview, setLlmNeedsReview] = useState(false);

  // Check for API key
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

  // Detect quality warnings whenever tools data changes
  const qualityWarnings = useMemo(() => {
    return detectEdgeCases({ tools });
  }, [tools]);

  // Determine which tools have data
  const toolDataStatus = useMemo(() => {
    const status = new Map<string, boolean>();

    // AI Readiness
    const aiData = tools['ai-readiness'] || {};
    const hasAiData = Object.keys(aiData).some(
      (k) =>
        ['Strategy', 'Data', 'Infrastructure', 'Talent', 'Governance', 'Culture'].includes(k) &&
        typeof aiData[k] === 'number' &&
        aiData[k] > 0
    );
    status.set('ai-readiness', hasAiData);

    // Leadership DNA
    const leadershipData = tools['leadership-dna'] || {};
    const hasLeadershipData = Object.keys(leadershipData).some(
      (k) => k.startsWith('current_') || k.startsWith('target_')
    );
    status.set('leadership-dna', hasLeadershipData);

    // SWOT
    const swotData = tools['swot'] || {};
    const hasSwotData =
      (Array.isArray(swotData.strengths) && swotData.strengths.length > 0) ||
      (Array.isArray(swotData.weaknesses) && swotData.weaknesses.length > 0) ||
      (Array.isArray(swotData.opportunities) && swotData.opportunities.length > 0) ||
      (Array.isArray(swotData.threats) && swotData.threats.length > 0);
    status.set('swot', hasSwotData);

    // Vision Canvas
    const visionData = tools['vision-canvas'] || {};
    const hasVisionData =
      (visionData.northStar && String(visionData.northStar).trim().length > 0) ||
      (Array.isArray(visionData.pillars) && visionData.pillars.length > 0) ||
      (Array.isArray(visionData.values) && visionData.values.length > 0);
    status.set('vision-canvas', hasVisionData);

    // Advisor Readiness
    const advisorData = tools['advisor-readiness'] || {};
    const hasAdvisorData =
      advisorData.answers && Object.keys(advisorData.answers).length > 0;
    status.set('advisor-readiness', hasAdvisorData);

    // Roadmap
    const roadmapData = tools['roadmap'] || {};
    const hasRoadmapData = Array.isArray(roadmapData.tasks) && roadmapData.tasks.length > 0;
    status.set('roadmap', hasRoadmapData);

    return status;
  }, [tools]);

  // Generate AI briefing
  const handleGenerateAIBriefing = useCallback(async () => {
    if (!apiKey) {
      setLlmError('Anthropic API key not set. Add VITE_ANTHROPIC_API_KEY to .env');
      return;
    }

    setLlmGenerating(true);
    setLlmError(null);
    setLlmNarrative(null);
    setLlmQaResult(null);
    setLlmNeedsReview(false);

    try {
      // Assemble payload from workspace
      const payload = assemblePayload({ tools, metadata });

      // Generate with retry
      const result = await generateWithRetry(payload, apiKey);

      // Success
      setLlmNarrative(result.narrative);
      localStorage.setItem('vwcg-llm-narrative', JSON.stringify(result.narrative));
      setLlmQaResult(result.qa);
      setLlmNeedsReview(result.needs_human_review);

      console.log('[ReportCenter] AI briefing generated:', {
        attempts: result.attempts,
        needs_review: result.needs_human_review,
        usage: result.usage,
      });
    } catch (error: any) {
      console.error('[ReportCenter] AI generation failed:', error);
      setLlmError(error.message || 'Failed to generate AI briefing. Please try again.');
    } finally {
      setLlmGenerating(false);
    }
  }, [tools, metadata, apiKey]);

  const handleDownloadPdf = useCallback(async () => {
    setIsGenerating(true);
    try {
      let element: HTMLElement | null = null;
      let reportType: ReportType = 'strategic-briefing';
      let title = 'Strategic Business Assessment';

      if (reportMode === 'strategic-briefing') {
        // Capture the unified strategic briefing
        element = document.getElementById('unified-strategic-briefing');
        reportType = 'strategic-briefing';
        title = 'Strategic Business Assessment';
      } else if (reportMode === 'ai-briefing') {
        // Capture the LLM briefing
        element = document.getElementById('llm-strategic-briefing');
        reportType = 'strategic-briefing';
        title = 'AI Strategic Business Assessment';
      } else if (reportMode === 'individual' && selectedTool) {
        // Capture the individual report
        element = document.getElementById('report-preview-container');
        const mapping = INDIVIDUAL_REPORT_MAP.find((m) => m.toolId === selectedTool);
        if (mapping) {
          reportType = mapping.reportType;
          title = mapping.label;
        }
      }

      if (!element) {
        console.error('Report element not found for PDF capture');
        return;
      }

      await savePdf(element, {
        title,
        clientName: metadata.name,
        reportType,
      });
    } catch (error) {
      console.error('PDF generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [reportMode, selectedTool, metadata.name]);

  // Print-ready PDF handler (browser print with real fonts + CSS page breaks)
  const handlePrintPdf = useCallback(() => {
    let targetSelector = '';
    let title = '';

    if (reportMode === 'strategic-briefing') {
      targetSelector = '#unified-strategic-briefing';
      title = `${metadata.name || 'Client'} — Strategic Business Assessment`;
    } else if (reportMode === 'ai-briefing' && llmNarrative) {
      targetSelector = '#llm-strategic-briefing';
      title = `${metadata.name || 'Client'} — AI Strategic Business Assessment`;
    } else if (reportMode === 'individual' && selectedTool) {
      targetSelector = '#report-preview-container';
      const mapping = INDIVIDUAL_REPORT_MAP.find(m => m.toolId === selectedTool);
      title = `${metadata.name || 'Client'} — ${mapping?.label || 'Report'}`;
    }

    if (!targetSelector) return;

    printReport({
      targetSelector,
      documentTitle: title,
    });
  }, [reportMode, selectedTool, metadata.name, llmNarrative]);

  // Determine if download button should be disabled
  const isDownloadDisabled =
    isGenerating ||
    (reportMode === 'individual' && !selectedTool) ||
    (reportMode === 'ai-briefing' && !llmNarrative);

  const isPrintDisabled =
    (reportMode === 'individual' && !selectedTool) ||
    (reportMode === 'ai-briefing' && !llmNarrative);

  // Render the selected report component
  const renderPreview = () => {
    if (reportMode === 'strategic-briefing') {
      return (
        <div className="bg-slate-500/10 p-4 rounded-xl border border-slate-200 h-[800px] overflow-y-auto custom-scrollbar">
          <div
            id="report-preview-container"
            className="bg-white shadow-2xl mx-auto min-h-[1000px] w-full max-w-[800px] p-8 origin-top transform scale-95"
          >
            <UnifiedStrategicBriefing />
          </div>
        </div>
      );
    }

    if (reportMode === 'ai-briefing') {
      // LLM briefing mode
      if (llmGenerating) {
        return (
          <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 h-[800px] flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-16 h-16 mb-4 animate-spin text-indigo-600" />
            <p className="text-lg font-semibold text-slate-600">Generating AI briefing...</p>
            <p className="text-sm text-slate-500 mt-2">This may take 30-60 seconds</p>
          </div>
        );
      }

      if (llmError) {
        return (
          <div className="bg-red-50 rounded-xl border border-red-200 p-8 h-[800px] flex flex-col items-center justify-center">
            <AlertTriangle className="w-16 h-16 mb-4 text-red-600" />
            <p className="text-lg font-semibold text-red-900">Generation Failed</p>
            <p className="text-sm text-red-700 mt-2 max-w-md text-center">{llmError}</p>
            <Button onClick={handleGenerateAIBriefing} className="mt-6 bg-red-600 hover:bg-red-700 text-white">
              Retry
            </Button>
          </div>
        );
      }

      if (llmNarrative) {
        return (
          <div className="space-y-4">
            {/* Warning banner if QA flagged issues */}
            {llmNeedsReview && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-amber-900 text-sm">QA Flagged Issues</p>
                  <p className="text-xs text-amber-800 mt-1">
                    Review the report carefully before sharing. Some content may need manual adjustment.
                  </p>
                </div>
              </div>
            )}

            {/* QA warnings (if any) */}
            {llmQaResult && llmQaResult.warnings.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="font-semibold text-blue-900 text-sm mb-2">QA Warnings ({llmQaResult.warnings.length})</p>
                <div className="space-y-1">
                  {llmQaResult.warnings.map((warning, i) => (
                    <p key={i} className="text-xs text-blue-800">
                      <span className="font-medium">{warning.check}:</span> {warning.issue}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Report preview */}
            <div className="bg-slate-500/10 p-4 rounded-xl border border-slate-200 h-[800px] overflow-y-auto custom-scrollbar">
              <div
                id="report-preview-container"
                className="bg-white shadow-2xl mx-auto min-h-[1000px] w-full max-w-[800px] p-8 origin-top transform scale-95"
              >
                <LLMStrategicBriefing narrative={llmNarrative} />
              </div>
            </div>
          </div>
        );
      }

      // Empty state - no narrative yet
      return (
        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 h-[800px] flex flex-col items-center justify-center text-slate-400">
          <Sparkles className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">Click "Generate AI Briefing" to create an AI-powered strategic narrative</p>
        </div>
      );
    }

    if (reportMode === 'individual' && selectedTool) {
      const mapping = INDIVIDUAL_REPORT_MAP.find((m) => m.toolId === selectedTool);
      if (mapping) {
        const { Component } = mapping;
        return (
          <div className="bg-slate-500/10 p-4 rounded-xl border border-slate-200 h-[800px] overflow-y-auto custom-scrollbar">
            <div
              id="report-preview-container"
              className="bg-white shadow-2xl mx-auto min-h-[1000px] w-full max-w-[800px] p-8 origin-top transform scale-95"
            >
              <Component />
            </div>
          </div>
        );
      }
    }

    // Empty state
    return (
      <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 h-[800px] flex flex-col items-center justify-center text-slate-400">
        <FileText className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg">Select a report from the left panel to preview</p>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FileDown className="w-8 h-8 text-indigo-600" />
            Report Center
          </h2>
          <p className="text-slate-500 mt-1">
            Generate consulting-grade PDF reports with the new report system.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Report Mode Selector */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Report Mode</h3>
            <div className="space-y-3">
              {/* Strategic Briefing Card */}
              <button
                onClick={() => {
                  setReportMode('strategic-briefing');
                  setSelectedTool(null);
                }}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  reportMode === 'strategic-briefing'
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <BookOpen
                    className={cn(
                      'w-6 h-6 flex-shrink-0 mt-0.5',
                      reportMode === 'strategic-briefing' ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        'font-semibold',
                        reportMode === 'strategic-briefing' ? 'text-indigo-900' : 'text-slate-700'
                      )}
                    >
                      Strategic Briefing
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Template-based 12-16 page unified assessment
                    </div>
                  </div>
                </div>
              </button>

              {/* AI-Powered Briefing Card */}
              <button
                onClick={() => {
                  setReportMode('ai-briefing');
                  setSelectedTool(null);
                }}
                disabled={!apiKey}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  reportMode === 'ai-briefing'
                    ? 'bg-purple-50 border-purple-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-purple-300',
                  !apiKey && 'opacity-50 cursor-not-allowed'
                )}
                title={!apiKey ? 'Set VITE_ANTHROPIC_API_KEY to enable' : ''}
              >
                <div className="flex items-start gap-3">
                  <Sparkles
                    className={cn(
                      'w-6 h-6 flex-shrink-0 mt-0.5',
                      reportMode === 'ai-briefing' ? 'text-purple-600' : 'text-slate-400'
                    )}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        'font-semibold',
                        reportMode === 'ai-briefing' ? 'text-purple-900' : 'text-slate-700'
                      )}
                    >
                      AI-Powered Briefing
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      AI-generated narrative with QA validation (~$1-2)
                    </div>
                    {!apiKey && (
                      <div className="text-xs text-red-600 mt-1">
                        API key required
                      </div>
                    )}
                  </div>
                </div>
              </button>

              {/* Individual Report Card */}
              <button
                onClick={() => setReportMode('individual')}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  reportMode === 'individual'
                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-indigo-300'
                )}
              >
                <div className="flex items-start gap-3">
                  <FileText
                    className={cn(
                      'w-6 h-6 flex-shrink-0 mt-0.5',
                      reportMode === 'individual' ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  />
                  <div className="flex-1">
                    <div
                      className={cn(
                        'font-semibold',
                        reportMode === 'individual' ? 'text-indigo-900' : 'text-slate-700'
                      )}
                    >
                      Individual Report
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Detailed single-tool report
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Briefing Generation (AI Mode Only) */}
          {reportMode === 'ai-briefing' && !llmNarrative && !llmGenerating && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Generate AI Narrative</h3>
              <p className="text-sm text-slate-600 mb-4">
                Creates a custom strategic briefing using Claude Sonnet, with quality validation by Claude Haiku.
              </p>
              <Button
                onClick={handleGenerateAIBriefing}
                disabled={llmGenerating || !apiKey}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {llmGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {llmGenerating ? 'Generating...' : 'Generate AI Briefing'}
              </Button>
            </div>
          )}

          {/* Tool Selector (Individual Mode Only) */}
          {reportMode === 'individual' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Select Report</h3>
              <div className="space-y-2">
                {INDIVIDUAL_REPORT_MAP.map((mapping) => {
                  const hasData = toolDataStatus.get(mapping.toolId) ?? false;
                  const isSelected = selectedTool === mapping.toolId;

                  return (
                    <button
                      key={mapping.toolId}
                      onClick={() => hasData && setSelectedTool(mapping.toolId)}
                      disabled={!hasData}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all',
                        !hasData && 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed',
                        hasData &&
                          isSelected &&
                          'bg-indigo-50 border-indigo-200 shadow-sm',
                        hasData &&
                          !isSelected &&
                          'bg-white border-slate-200 hover:border-indigo-300'
                      )}
                    >
                      <div className="font-medium text-sm">
                        <span
                          className={cn(
                            isSelected && hasData ? 'text-indigo-900' : 'text-slate-700'
                          )}
                        >
                          {mapping.label}
                        </span>
                        {!hasData && (
                          <span className="text-xs text-slate-400 block mt-0.5">
                            No data available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quality Warnings */}
          {qualityWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 text-sm mb-2">
                    Quality Notices
                  </h4>
                  <div className="space-y-2">
                    {qualityWarnings.map((warning, idx) => (
                      <div key={idx} className="text-xs text-amber-800">
                        <span className="font-medium">{warning.type}:</span> {warning.details}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Download Buttons */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-3">
            {/* Print-Ready PDF — recommended */}
            <Button
              onClick={handlePrintPdf}
              disabled={isPrintDisabled}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg no-print"
            >
              <Printer className="w-4 h-4 mr-2" />
              Download Print-Ready PDF
            </Button>
            <p className="text-xs text-slate-500 text-center">
              Best quality — real fonts, proper page breaks
            </p>

            {/* Divider */}
            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs text-slate-400">or</span>
              </div>
            </div>

            {/* Existing jsPDF button — unchanged behavior */}
            <Button
              onClick={handleDownloadPdf}
              disabled={isDownloadDisabled}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white no-print"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4 mr-2" />
              )}
              {isGenerating ? 'Generating PDF...' : 'Download PDF (Legacy)'}
            </Button>
            <p className="text-xs text-slate-400 text-center">
              Raster-based fallback via html2canvas + jsPDF
            </p>
          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="lg:col-span-2">{renderPreview()}</div>
      </div>
    </div>
  );
};
