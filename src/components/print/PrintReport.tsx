/**
 * PrintReport Component
 *
 * Dedicated print route that renders reports WITHOUT AppShell wrapper.
 * Used by E2E tests for clean PDF generation via page.pdf().
 *
 * Route: /report/print/:reportType
 *
 * Supported report types:
 *   - unified             → UnifiedStrategicBriefing
 *   - ai-readiness        → AIReadinessReport
 *   - leadership-dna      → LeadershipDNAReport
 *   - swot                → SwotReport
 *   - vision-canvas       → VisionCanvasReport
 *   - advisor-readiness   → AdvisorReadinessReport
 *   - roadmap             → RoadmapReport
 */

import { useParams } from 'react-router-dom';
import type { FC } from 'react';

// Report components
import { UnifiedStrategicBriefing } from '@/report/unified/UnifiedStrategicBriefing';
import {
  AIReadinessReport,
  LeadershipDNAReport,
  SwotReport,
  VisionCanvasReport,
  AdvisorReadinessReport,
  RoadmapReport,
} from '@/report/individual';

/**
 * Map reportType param to report component and container ID
 */
const REPORT_MAP: Record<
  string,
  {
    Component: FC;
    containerId: string;
  }
> = {
  unified: {
    Component: UnifiedStrategicBriefing,
    containerId: 'unified-strategic-briefing',
  },
  'ai-readiness': {
    Component: AIReadinessReport,
    containerId: 'ai-readiness',
  },
  'leadership-dna': {
    Component: LeadershipDNAReport,
    containerId: 'leadership-dna',
  },
  swot: {
    Component: SwotReport,
    containerId: 'swot',
  },
  'vision-canvas': {
    Component: VisionCanvasReport,
    containerId: 'vision-canvas',
  },
  'advisor-readiness': {
    Component: AdvisorReadinessReport,
    containerId: 'advisor-readiness',
  },
  roadmap: {
    Component: RoadmapReport,
    containerId: 'roadmap',
  },
};

/**
 * PrintReport Component
 *
 * Renders report without AppShell (no sidebar, header, navigation).
 * Container has full viewport width and white background.
 */
export const PrintReport: FC = () => {
  const { reportType } = useParams<{ reportType: string }>();

  // Validate reportType
  if (!reportType || !REPORT_MAP[reportType]) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Report Type</h1>
          <p className="text-slate-600">
            Report type &quot;{reportType}&quot; not found.
          </p>
          <p className="text-sm text-slate-500 mt-4">
            Valid types: {Object.keys(REPORT_MAP).join(', ')}
          </p>
        </div>
      </div>
    );
  }

  // Get report configuration
  const { Component, containerId } = REPORT_MAP[reportType];

  return (
    <div className="min-h-screen bg-white">
      <div id={containerId} className="w-full">
        <Component />
      </div>
    </div>
  );
};
